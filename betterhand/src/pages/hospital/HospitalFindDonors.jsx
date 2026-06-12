import { useState } from 'react'
import NearestDonors from '../../components/hospital/NearestDonors'
import { Search } from 'lucide-react'

export default function HospitalFindDonors() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2"><Search size={22} className="text-brand-600"/> Find Donors</h1>
        <p className="text-ink-400 text-sm mt-0.5">Search nearby eligible donors by blood group and distance</p>
      </div>
      <div className="card p-5">
        <NearestDonors/>
      </div>
    </div>
  )
}
