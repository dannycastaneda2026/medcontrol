'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '../../../../components/FileUpload'

interface Props {
  alumnoId: number
  onSuccess: (ordenId: number) => void
}

export default function OrdenForm({ alumnoId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const [form, setForm] = useState({
    nombre_farmaco: '',
    dosis: '',
    fecha_inicio: '',
    fecha_termino: '',
    documento_orden_medica: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('ordenes_medicas')
        .insert({
          id_alumno: alumnoId,
          nombre_farmaco: form.nombre_farmaco,
          dosis: form.dosis,
          fecha_inicio: form.fecha_inicio,
          fecha_termino: form.fecha_termino,
          documento_orden_medica: form.documento_orden_medica || null,
        })
        .select()
        .single()

      if (error) throw error

      onSuccess(data.id_orden)
    } catch (err: any) {
      setError(err.message || 'Error al crear orden')
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
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fármaco *</label>
          <input
            type="text"
            required
            value={form.nombre_farmaco}
            onChange={e => setForm(f => ({ ...f, nombre_farmaco: e.target.value }))}
            placeholder="Paracetamol, Ibuprofeno, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosis *</label>
          <input
            type="text"
            required
            value={form.dosis}
            onChange={e => setForm(f => ({ ...f, dosis: e.target.value }))}
            placeholder="5 ml, 1/2 comprimido, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
          <input
            type="date"
            required
            value={form.fecha_inicio}
            onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Término *</label>
          <input
            type="date"
            required
            value={form.fecha_termino}
            onChange={e => setForm(f => ({ ...f, fecha_termino: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Subida de documento */}
      <div className="md:col-span-2">
        <FileUpload
          label="Documento de la Orden Médica (PDF o foto)"
          currentUrl={form.documento_orden_medica}
          onUpload={(url) => setForm(f => ({ ...f, documento_orden_medica: url }))}
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear Orden y Continuar →'}
      </button>
    </form>
  )
}