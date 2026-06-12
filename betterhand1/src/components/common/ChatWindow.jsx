import { useState, useEffect, useRef } from 'react'
import { donationApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { useWsStore } from '../../store/wsStore'
import { Send, Phone, MessageSquare } from 'lucide-react'
import { fmtTime, callLink, whatsappLink } from '../../utils/helpers'
import toast from 'react-hot-toast'
import Spinner from './Spinner'

export default function ChatWindow({ responseId, otherPhone, otherWhatsapp, otherName, className = '' }) {
  const { user } = useAuthStore()
  const { on, off } = useWsStore()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!responseId) return
    setLoading(true)
    donationApi.chatHistory(responseId)
      .then(r => setMessages(r.data.results || r.data))
      .catch(() => toast.error('Could not load chat'))
      .finally(() => setLoading(false))
  }, [responseId])

  useEffect(() => {
    const handler = data => {
      if (String(data.response_id) === String(responseId) || !data.response_id) {
        setMessages(prev => {
          if (prev.find(m => m.id === data.message_id)) return prev
          return [...prev, { id: data.message_id, sender_id: data.sender_id,
            sender_role: data.sender_role, sender_name: data.sender_name,
            message: data.message, created_at: data.created_at }]
        })
      }
    }
    on('chat_message', handler)
    return () => off('chat_message', handler)
  }, [responseId, on, off])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const r = await donationApi.sendMessage(responseId, { message: text.trim() })
      setMessages(prev => [...prev, r.data])
      setText('')
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  const isMine = m => String(m.sender_id) === String(user?.id)

  return (
    <div className={`card flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-brand-400"/>
          <span className=" font-semibold text-sm text-surface-900">
            {otherName ? `Chat with ${otherName}` : 'Live Chat'}
          </span>
        </div>
        <div className="flex gap-2">
          {otherPhone && (
            <a href={callLink(otherPhone)} className="btn-ghost text-xs px-3 py-1.5 gap-1.5">
              <Phone size={13}/> Call
            </a>
          )}
          {otherWhatsapp && (
            <a href={whatsappLink(otherWhatsapp)} target="_blank" rel="noreferrer"
               className="badge badge-green text-xs gap-1.5 cursor-pointer">
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin min-h-0 max-h-80">
        {loading ? (
          <div className="flex justify-center py-6"><Spinner className="text-brand-400"/></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-surface-400 text-sm py-6">No messages yet. Say hello! 👋</p>
        ) : messages.map(m => (
          <div key={m.id} className={`flex ${isMine(m) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm
              ${isMine(m)
                ? 'bg-gradient-to-r from-brand-600 to-brand-400 text-surface-900 rounded-br-sm'
                : 'bg-white/8 text-surface-900/90 rounded-bl-sm'}`}>
              {!isMine(m) && <p className="text-xs text-surface-400 mb-1 ">{m.sender_name}</p>}
              <p className="leading-relaxed">{m.message}</p>
              <p className={`text-[10px] mt-1 ${isMine(m) ? 'text-surface-600' : 'text-surface-400'}`}>
                {fmtTime(m.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-surface-200 flex gap-2">
        <input
          className="flex-1 input text-sm py-2"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button onClick={send} disabled={sending || !text.trim()} className="btn-primary px-3 py-2">
          {sending ? <Spinner size={16}/> : <Send size={16}/>}
        </button>
      </div>
    </div>
  )
}
