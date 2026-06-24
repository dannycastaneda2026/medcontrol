'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'

interface Alumno {
  id_alumno: number
  nombre: string
  apellidos: string
  nivel_educativo: string
}

interface HorarioInput {
  hora: string
  observaciones: string
  dias: string[]
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function NuevaOrdenPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAlumnos, setLoadingAlumnos] = useState(true)
  const [error, setError] = useState('')
  const [horarios, setHorarios] = useState<HorarioInput[]>([
    { hora: '', observaciones: '', dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }
  ])
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    id_alumno: '',
    nombre_farmaco: '',
    dosis: '',
    fecha_inicio: '',
    fecha_termino: '',
    documento_orden_medica: '',
  })

  useEffect(() => {
    async function cargarAlumnos() {
      const { data, error } = await supabase
        .from('alumnos')
        .select('id_alumno, nombre, apellidos, nivel_educativo')
        .order('nombre')

      if (error) {
        console.error('Error cargando alumnos:', error)
      } else {
        setAlumnos(data || [])
      }
      setLoadingAlumnos(false)
    }

    cargarAlumnos()
  }, [])

  const agregarHorario = () => {
    setHorarios([...horarios, { hora: '', observaciones: '', dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }])
  }

  const eliminarHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index))
  }

  const actualizarHorario = (index: number, campo: keyof HorarioInput, valor: any) => {
    const nuevos = [...horarios]
    nuevos[index] = { ...nuevos[index], [campo]: valor }
    setHorarios(nuevos)
  }

  const toggleDia = (index: number, dia: string) => {
    const nuevos = [...horarios]
    const dias = nuevos[index].dias
    if (dias.includes(dia)) {
      nuevos[index].dias = dias.filter(d => d !== dia)
    } else {
      nuevos[index].dias = [...dias, dia]
    }
    setHorarios(nuevos)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validar que haya al menos un horario completo
      const horariosValidos = horarios.filter(h => h.hora && h.dias.length > 0)
      if (horariosValidos.length === 0) {
        throw new Error('Debe agregar al menos un horario válido')
      }

      // 1. Crear la orden médica
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes_medicas')
        .insert([
          {
            id_alumno: parseInt(formData.id_alumno),
            nombre_farmaco: formData.nombre_farmaco,
            dosis: formData.dosis,
            fecha_inicio: formData.fecha_inicio,
            fecha_termino: formData.fecha_termino,
            documento_orden_medica: formData.documento_orden_medica || null,
          },
        ])
        .select()
        .single()

      if (ordenError) throw ordenError

      // 2. Crear los horarios de medicación (el trigger generará las entregas automáticamente)
      const horariosInsert = horariosValidos.map(h => ({
        id_orden: orden.id_orden,
        hora_administracion: h.hora,
        observaciones: h.observaciones,
        dias_semana: h.dias.join(','),
      }))

      const { error: horariosError } = await supabase
        .from('horarios_medicacion')
        .insert(horariosInsert)

      if (horariosError) throw horariosError

      router.push('/admin/ordenes')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear la orden médica')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Orden Médica</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Alumno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alumno *
          </label>
          <select
            name="id_alumno"
            required
            value={formData.id_alumno}
            onChange={(e) => setFormData({...formData, id_alumno: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              {loadingAlumnos ? 'Cargando alumnos...' : 'Seleccionar alumno...'}
            </option>
            {alumnos.map((alumno) => (
              <option key={alumno.id_alumno} value={alumno.id_alumno}>
                {alumno.nombre} {alumno.apellidos} - {alumno.nivel_educativo}
              </option>
            ))}
          </select>
        </div>

        {/* Medicamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Fármaco *
            </label>
            <input
              type="text"
              required
              value={formData.nombre_farmaco}
              onChange={(e) => setFormData({...formData, nombre_farmaco: e.target.value})}
              placeholder="Paracetamol, Ibuprofeno, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosis *
            </label>
            <input
              type="text"
              required
              value={formData.dosis}
              onChange={(e) => setFormData({...formData, dosis: e.target.value})}
              placeholder="5 ml, 1/2 comprimido, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              required
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Término *
            </label>
            <input
              type="date"
              required
              value={formData.fecha_termino}
              onChange={(e) => setFormData({...formData, fecha_termino: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Documento PDF */}
        <div className="md:col-span-2">
          <FileUpload
            label="Documento de la Orden Médica (PDF o foto)"
            currentUrl={formData.documento_orden_medica}
            onUpload={(url) => setFormData({...formData, documento_orden_medica: url})}
          />
        </div>

        {/* Horarios de Medicación */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Horarios de Administración</h2>
            <button
              type="button"
              onClick={agregarHorario}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Agregar horario
            </button>
          </div>

          {horarios.map((horario, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Horario #{index + 1}</span>
                {horarios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarHorario(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={horario.hora}
                    onChange={(e) => actualizarHorario(index, 'hora', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Observaciones
                  </label>
                  <input
                    type="text"
                    value={horario.observaciones}
                    onChange={(e) => actualizarHorario(index, 'observaciones', e.target.value)}
                    placeholder="Con comida, post-almuerzo, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Días de la semana *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(index, dia)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        horario.dias.includes(dia)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/admin/ordenes')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Orden Médica'}
          </button>
        </div>
      </form>
    </div>
  )
}