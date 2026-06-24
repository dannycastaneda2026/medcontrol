'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) throw error

      setStatus('sent')
      setMessage('Revisa tu correo para continuar con el restablecimiento.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus('error')
      setMessage(message || 'No se pudo enviar el correo de restablecimiento.')
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Restablecer contraseña</h2>
        <p className="mt-2 text-sm text-gray-600">Ingresa el correo del usuario para enviar el enlace de restablecimiento.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {message && (
          <div className={`rounded-lg px-4 py-3 ${status === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending' || status === 'sent'}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'sent' ? 'Enviado' : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Volver a <Link href="/login" className="text-blue-600 hover:underline">iniciar sesión</Link>.
      </p>
    </div>
  )
}
