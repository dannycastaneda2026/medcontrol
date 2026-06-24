'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  apoderadoId: number
  onSuccess: (alumnoId: number) => void
}

export default function AlumnoForm({ apoderadoId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    nivel_educativo: '',
    direccion: '',
    telefono_contacto_emergencias: '',
    plan_salud: '',
    centros_medicos_recomendados: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('alumnos')
        .insert({
          ...form,
          id_apoderado: apoderadoId,
        })
        .select()
        .single()

      if (error) throw error
      onSuccess(data.id_alumno)
    } catch (err: any) {
      setError(err.message || 'Error al crear alumno')
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            required
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
          <input
            type="text"
            required
            value={form.apellidos}
            onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento *</label>
          <input
            type="date"
            required
            value={form.fecha_nacimiento}
            onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Educativo *</label>
          <select
            required
            value={form.nivel_educativo}
            onChange={e => setForm(f => ({ ...f, nivel_educativo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="Sala Cuna">Sala Cuna</option>
            <option value="Medio Menor">Medio Menor</option>
            <option value="Medio Mayor">Medio Mayor</option>
            <option value="Transición">Transición</option>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Emergencias *</label>
          <input
            type="tel"
            required
            value={form.telefono_contacto_emergencias}
            onChange={e => setForm(f => ({ ...f, telefono_contacto_emergencias: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Salud *</label>
          <select
            required
            value={form.plan_salud}
            onChange={e => setForm(f => ({ ...f, plan_salud: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="FONASA">FONASA</option>
            <option value="ISAPRE">ISAPRE</option>
            <option value="Particular">Particular</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Centros Médicos Recomendados</label>
          <textarea
            value={form.centros_medicos_recomendados}
            onChange={e => setForm(f => ({ ...f, centros_medicos_recomendados: e.target.value }))}
            rows={2}
            placeholder="Hospital de Niños, Clínica Alemana, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear Alumno y Continuar →'}
      </button>
    </form>
  )
}