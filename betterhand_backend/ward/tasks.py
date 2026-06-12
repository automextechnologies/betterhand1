import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def broadcast_alert_to_ward_donors(alert_id):
    return _do_broadcast(alert_id)


def _do_broadcast(alert_id):
    """
    Broadcast ward alert ONLY to donors registered in this ward member's exact ward.
    Matches strictly on ward_number + local_body_name + state.
    Creates real DonationResponse records so donors see Accept/Reject in their dashboard.
    """
    from .models import WardBloodAlert, WardDonorNotification
    from accounts.models import DonorProfile
    from donation.models import DonationResponse
    from django.utils import timezone
    from django.conf import settings
    from datetime import timedelta
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    try:
        alert = WardBloodAlert.objects.select_related('ward_member__ward', 'blood_request').get(id=alert_id)
    except WardBloodAlert.DoesNotExist:
        logger.error(f'WardBloodAlert #{alert_id} not found')
        return 0

    ward = alert.ward_member.ward
    br   = alert.blood_request

    # Keep request active so responses show in donor pending list
    if br and br.status not in ('pending', 'active'):
        br.status = 'active'
        br.save(update_fields=['status'])

    cooldown = timezone.now() - timedelta(days=settings.DONOR_COOLDOWN_DAYS)

    # ── STRICT WARD MATCH — same ward only, matching blood group ──
    donors = DonorProfile.objects.filter(
        blood_group=alert.blood_group,
        is_available=True,
        ward_number__iexact=str(ward.ward_number),
        local_body_name__iexact=ward.local_body_name,
        state__iexact=ward.state,
    ).exclude(
        user__donation_records__donated_at__gte=cooldown
    ).select_related('user').order_by('-questionnaire_completed')

    logger.info(f'WardAlert #{alert_id}: {alert.blood_group} — '
                f'ward {ward.ward_number}, {ward.local_body_name}, {ward.state} '
                f'→ found {donors.count()} matching donors')

    ch = get_channel_layer()
    n = 0
    for dp in donors:
        user = dp.user
        WardDonorNotification.objects.get_or_create(
            alert=alert, donor=user,
            defaults={'status': 'pending', 'contacted_at': timezone.now()})

        if br:
            resp, created = DonationResponse.objects.get_or_create(
                request=br, donor=user,
                defaults={'status': 'pending', 'notification_sent_at': timezone.now()})
            if created:
                try:
                    async_to_sync(ch.group_send)(f'donor_{user.id}', {
                        'type': 'donation.event', 'event_type': 'new_request',
                        'payload': {
                            'response_id': resp.id, 'request_id': br.id,
                            'blood_group': alert.blood_group, 'urgency': alert.urgency,
                            'hospital_name': alert.hospital_name,
                            'units_needed': br.units_needed,
                            'patient_name': alert.patient_name,
                            'via_ward': True, 'ward_member_name': alert.ward_member.full_name,
                        }})
                except Exception:
                    pass

        if user.fcm_token:
            try:
                from donation.notification_service import send_push_notification
                send_push_notification(user.fcm_token,
                    f'🩸 Ward Alert — {alert.blood_group}',
                    f'{alert.ward_member.full_name} requests {alert.blood_group} for {alert.hospital_name}.',
                    {'type': 'ward_blood_alert', 'alert_id': str(alert_id)})
            except Exception:
                pass
        n += 1

    alert.status = 'notified'
    alert.save(update_fields=['status'])
    logger.info(f'WardAlert #{alert_id}: broadcast to {n} donors in ward {ward.ward_number}')
    return n
