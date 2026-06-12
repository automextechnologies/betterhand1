import { Link } from 'react-router-dom'
import Logo from '../../components/common/Logo'
import { ArrowLeft, Shield } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-ink-200/50 px-6 lg:px-16 py-3.5 flex items-center justify-between">
        <Logo/>
        <Link to="/" className="btn-ghost text-sm font-display"><ArrowLeft size={14}/> Back</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center"><Shield size={24} className="text-brand-600"/></div>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Privacy Policy</h1>
            <p className="text-ink-400 text-sm font-body">Last updated: June 2026</p>
          </div>
        </div>
        <div className="card p-8 space-y-6 font-body text-ink-600 leading-relaxed text-[15px]">
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">1. Information We Collect</h2>
            <p>We collect personal information you provide when registering, including your name, email address, phone number, blood group, and location data. For hospitals, we collect facility name, registration number, and address. For ward members, we collect ward assignment details and designation.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">2. Location Data</h2>
            <p>BetterHand uses your GPS location to match blood donors with nearby hospitals. Location data is collected with your explicit consent and is used solely for donor-hospital matching and navigation. Your location is updated periodically while you are logged in and is not shared with third parties.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">3. How We Use Your Information</h2>
            <p>Your information is used to: facilitate blood donation matching between hospitals and donors; enable real-time communication between parties; calculate distance and ETA for donor navigation; maintain donation history and cooldown periods; send notifications about blood requests; and improve our platform services.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">4. Data Sharing</h2>
            <p>We share your contact information and location only with hospitals you respond to, and with ward members coordinating donations in your area. We do not sell your personal data to third parties. Bystander contact information provided by hospitals is shared only with relevant ward members for coordination purposes.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">5. Data Security</h2>
            <p>We implement industry-standard security measures including JWT authentication, encrypted data transmission, and secure password hashing to protect your information. Access to your data is restricted to authorized personnel only.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">6. Data Retention</h2>
            <p>Your account data is retained as long as your account is active. Donation records are maintained for medical history purposes. You may request deletion of your account and associated data by contacting our support team.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You can toggle your availability status at any time to stop receiving blood requests. You can revoke location permissions through your browser settings.</p>
          </section>
          <section>
            <h2 className="font-display font-bold text-ink-900 text-lg mb-2">8. Contact Us</h2>
            <p>For privacy-related inquiries, please contact us at <strong className="text-brand-600">privacy@betterhand.org</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
