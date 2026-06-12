import { Link } from 'react-router-dom'
import Logo from '../../components/common/Logo'
import { ArrowLeft, FileText } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-ink-200/50 px-6 lg:px-16 py-3.5 flex items-center justify-between">
        <Logo/>
        <Link to="/" className="btn-ghost text-sm font-display"><ArrowLeft size={14}/> Back</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center"><FileText size={24} className="text-amber-600"/></div>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Terms & Conditions</h1>
            <p className="text-ink-400 text-sm font-body">Last updated: June 2026</p>
          </div>
        </div>
        <div className="card p-8 space-y-6 font-body text-ink-600 leading-relaxed text-[15px]">
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using BetterHand, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">2. Platform Purpose</h2>
            <p>BetterHand is a platform that connects hospitals requiring blood with eligible donors. We facilitate communication and coordination but are not a medical service provider. All medical decisions should be made by qualified healthcare professionals.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">3. User Responsibilities</h2>
            <p><strong>Hospitals</strong> must provide accurate patient and blood requirement information. <strong>Donors</strong> must provide truthful health and blood group information and must meet eligibility criteria (age, weight, health status, and cooldown period). <strong>Ward Members</strong> must be verified government representatives and must handle donor information responsibly.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">4. Donor Eligibility</h2>
            <p>Donors must be at least 18 years old, weigh at least 50kg, and be in good health. A minimum 90-day cooldown period between donations is enforced by the platform. Donors are responsible for disclosing any medical conditions that may affect eligibility.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">5. Location Services</h2>
            <p>Accurate location data is essential for our matching system. By enabling location services, you consent to your GPS coordinates being used for donor-hospital matching and navigation purposes.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">6. Communication</h2>
            <p>You consent to receiving notifications about blood requests, donation confirmations, and platform updates via push notifications, in-app messages, and WebSocket connections. You may adjust notification preferences in your profile settings.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">7. Limitation of Liability</h2>
            <p>BetterHand is provided "as is" without warranties of any kind. We are not liable for any medical outcomes, delays in donor response, or communication failures. We do not guarantee the availability of donors or the success of any blood request.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">8. Account Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, provide false information, or misuse the platform. Users may delete their accounts at any time.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">9. Changes to Terms</h2>
            <p>We may update these terms periodically. Continued use of BetterHand after changes constitutes acceptance of the updated terms.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">10. Contact</h2>
            <p>For questions about these terms, contact us at <strong className="text-brand-600">legal@betterhand.org</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
