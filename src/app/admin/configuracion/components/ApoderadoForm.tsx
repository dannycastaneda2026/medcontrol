'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: number
  userData: { rut: string; nombre_completo: string; email: string }
  onSuccess: (apoderadoId: number) => void
}

export default function ApoderadoForm({ userId, userData, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const [form, setForm] = useState({
    telefono: '',
    telefono_alternativo: '',
    correo: '',
    direccion: '',
    parentesco: '',
    es_contacto_emergencia: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('apoderados')
        .insert({
          id_usuario: userId,
          rut: userData.rut,
          nombre_completo: userData.nombre_completo,
          telefono: form.telefono,
          telefono_alternativo: form.telefono_alternativo || null,
          correo: form.correo || userData.email,
          direccion: form.direccion,
          parentesco: form.parentesco,
          es_contacto_emergencia: form.es_contacto_emergencia,
        })
        .select()
        .single()

      if (error) throw error
      onSuccess(data.id_apoderado)
    } catch (err: any) {
      setError(err.message || 'Error al crear apoderado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal *</label>
          <input
            type="tel"
            required
            value={form.telefono}
            onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Alternativo</label>
          <input
            type="tel"
            value={form.telefono_alternativo}
            onChange={e => setForm(f => ({ ...f, telefono_alternativo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Apoderado</label>
          <input
            type="email"
            value={form.correo}
            onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
            placeholder={userData.email}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco *</label>
          <select
            required
            value={form.parentesco}
            onChange={e => setForm(f => ({ ...f, parentesco: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="Madre">Madre</option>
            <option value="Padre">Padre</option>
            <option value="Abuela">Abuela</option>
            <option value="Abuelo">Abuelo</option>
            <option value="Tía">Tía</option>
            <option value="Tío">Tío</option>
            <option value="Tutor legal">Tutor legal</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
          <input
            type="text"
            required
            value={form.direccion}
            onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.es_contacto_emergencia}
              onChange={e => setForm(f => ({ ...f, es_contacto_emergencia: e.target.checked }))}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Es contacto de emergencia principal</span>
          </label>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar Apoderado y Continuar →'}
      </button>
    </form>
  )
}