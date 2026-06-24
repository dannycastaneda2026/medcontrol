'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  email: string
}

export default function ResetPasswordButton({ email }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleReset = async () => {
    setStatus('sending')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) throw error

      setStatus('sent')
      setMessage('Se envió el enlace de restablecimiento.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus('error')
      setMessage(message || 'No se pudo enviar el correo de restablecimiento.')
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={status === 'sending' || status === 'sent'}
        onClick={handleReset}
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sent' ? 'Enviado' : 'Restablecer contraseña'}
      </button>
      {message && (
        <p className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
