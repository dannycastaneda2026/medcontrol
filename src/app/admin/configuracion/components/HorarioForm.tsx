'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  ordenId: number
  onSuccess: () => void
}

export default function HorarioForm({ ordenId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const [form, setForm] = useState({
    hora_administracion: '',
    observaciones: '',
    dias_semana: 'Lunes,Martes,Miércoles,Jueves,Viernes',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('horarios_medicacion')
        .insert({
          id_orden: ordenId,
          hora_administracion: form.hora_administracion,
          observaciones: form.observaciones || null,
          dias_semana: form.dias_semana,
        })

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear horario')
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
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 Al crear el horario, el sistema generará automáticamente las entregas para cada día dentro del rango de fechas de la orden médica.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Administración *</label>
          <input
            type="time"
            required
            value={form.hora_administracion}
            onChange={e => setForm(f => ({ ...f, hora_administracion: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Días de la Semana *</label>
          <input
            type="text"
            required
            value={form.dias_semana}
            onChange={e => setForm(f => ({ ...f, dias_semana: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            value={form.observaciones}
            onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
            rows={2}
            placeholder="Con comida, post-almuerzo, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Creando...' : '✓ Crear Horario y Finalizar'}
      </button>
    </form>
  )
}