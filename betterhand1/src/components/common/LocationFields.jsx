import { STATES, getDistricts, LOCAL_BODY_TYPES } from '../../utils/locationData'
import { ChevronDown } from 'lucide-react'

const SS = { color:'#27272a', backgroundColor:'#ffffff' }
const OS = { backgroundColor:'#ffffff', color:'#27272a' }

export default function LocationFields({ register, errors, watch, prefix='', required=true }) {
  const selectedState = watch ? watch(`${prefix}state`) : ''
  const districts     = getDistricts(selectedState)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">State {required&&'*'}</label>
          <div className="relative">
            <select className="select pr-8" style={SS}
              {...register(`${prefix}state`, required?{required:'Required'}:{})}>
              <option value="" style={OS}>Select state</option>
              {STATES.map(s=><option key={s} value={s} style={OS}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
          {errors?.[`${prefix}state`] && <p className="text-red-600 text-xs mt-1">{errors[`${prefix}state`]?.message}</p>}
        </div>
        <div>
          <label className="label">District {required&&'*'}</label>
          <div className="relative">
            <select className="select pr-8" style={SS}
              {...register(`${prefix}district`, required?{required:'Required'}:{})}>
              <option value="" style={OS}>{selectedState?'Select district':'Select state first'}</option>
              {districts.map(d=><option key={d} value={d} style={OS}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
          {errors?.[`${prefix}district`] && <p className="text-red-600 text-xs mt-1">{errors[`${prefix}district`]?.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Local Body Type {required&&'*'}</label>
          <div className="relative">
            <select className="select pr-8" style={SS}
              {...register(`${prefix}local_body_type`, required?{required:'Required'}:{})}>
              <option value="" style={OS}>Select type</option>
              {LOCAL_BODY_TYPES.map(t=><option key={t.value} value={t.value} style={OS}>{t.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"/>
          </div>
        </div>
        <div>
          <label className="label">Local Body Name {required&&'*'}</label>
          <input className="input" placeholder="e.g. Kochi Corporation"
            {...register(`${prefix}local_body_name`, required?{required:'Required'}:{})}/>
          {errors?.[`${prefix}local_body_name`] && <p className="text-red-600 text-xs mt-1">{errors[`${prefix}local_body_name`]?.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Ward Number {required&&'*'}</label>
          <input className="input" placeholder="e.g. 15"
            {...register(`${prefix}ward_number`, required?{required:'Required'}:{})}/>
          {errors?.[`${prefix}ward_number`] && <p className="text-red-600 text-xs mt-1">{errors[`${prefix}ward_number`]?.message}</p>}
        </div>
        <div>
          <label className="label">Pincode</label>
          <input className="input" placeholder="682001" {...register(`${prefix}pincode`)}/>
        </div>
      </div>
    </div>
  )
}
