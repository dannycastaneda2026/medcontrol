'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function MarcarEntregaPage() {
  const params = useParams()
  const idEntrega = parseInt(params.id as string)
  
  const [entrega, setEntrega] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!idEntrega || isNaN(idEntrega)) {
      setError('ID de entrega inválido')
      setLoading(false)
      return
    }

    async function cargarEntrega() {
      const { data, error } = await supabase
        .from('entregas_medicamentos')
        .select(`
          *,
          horarios_medicacion!inner (
            hora_administracion,
            observaciones,
            ordenes_medicas!inner (
              nombre_farmaco,
              dosis,
              alumnos!inner (
                nombre,
                apellidos,
                nivel_educativo
              )
            )
          )
        `)
        .eq('id_entrega', idEntrega)
        .single()

      if (error) {
        setError('Error al cargar la entrega')
        console.error(error)
      } else {
        setEntrega(data)
        if (data.entregado) {
          setObservaciones(data.observaciones_entrega || '')
        }
      }
      setLoading(false)
    }

    cargarEntrega()
  }, [idEntrega])

  const handleMarcarEntregado = async () => {
    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      const { data: userData } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .single()

      const { error: updateError } = await supabase
        .from('entregas_medicamentos')
        .update({
          entregado: true,
          hora_entrega_real: new Date().toISOString(),
          id_entregado_por: userData?.id_usuario,
          observaciones_entrega: observaciones || null,
        })
        .eq('id_entrega', idEntrega)

      if (updateError) throw updateError

      router.push('/educadora/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al marcar la entrega')
      setSubmitting(false)
    }
  }

  const handleDesmarcar = async () => {
    setSubmitting(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('entregas_medicamentos')
        .update({
          entregado: false,
          hora_entrega_real: null,
          id_entregado_por: null,
          observaciones_entrega: null,
        })
        .eq('id_entrega', idEntrega)

      if (updateError) throw updateError

      router.push('/educadora/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al desmarcar la entrega')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!entrega) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-gray-500 text-lg">Entrega no encontrada</div>
        <Link href="/educadora/dashboard" className="text-green-600 hover:text-green-800 mt-4 inline-block">
          ← Volver al dashboard
        </Link>
      </div>
    )
  }

  const orden = entrega.horarios_medicacion?.ordenes_medicas
  const alumno = orden?.alumnos
  const horario = entrega.horarios_medicacion

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/educadora/dashboard" className="text-green-600 hover:text-green-800 text-sm font-medium mb-6 inline-block">
        ← Volver a Entregas de Hoy
      </Link>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className={`p-6 ${entrega.entregado ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {entrega.entregado ? '✓ Entrega Registrada' : 'Marcar Entrega'}
              </h1>
              <p className="text-gray-500 mt-1">
                {new Date(entrega.fecha_entrega).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {horario?.hora_administracion?.slice(0, 5)}
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Alumno</div>
              <div className="font-semibold text-lg">
                {alumno?.nombre} {alumno?.apellidos}
              </div>
              <div className="text-sm text-gray-500">{alumno?.nivel_educativo}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Medicamento</div>
              <div className="font-semibold text-lg text-blue-600">
                {orden?.nombre_farmaco}
              </div>
              <div className="text-sm text-gray-500">Dosis: {orden?.dosis}</div>
            </div>
          </div>

          {horario?.observaciones && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <span className="font-medium">💡 Observación del horario:</span> {horario.observaciones}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones de la entrega (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Ej: El niño tomó el medicamento sin problemas, reacción alérgica, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              disabled={entrega.entregado}
            />
          </div>

          {entrega.entregado ? (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-medium">
                  ✓ Entregado a las {entrega.hora_entrega_real ? new Date(entrega.hora_entrega_real).toLocaleTimeString('es-CL') : '--:--'}
                </div>
                {entrega.observaciones_entrega && (
                  <div className="text-green-700 text-sm mt-1">
                    Observación: {entrega.observaciones_entrega}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleDesmarcar}
                disabled={submitting}
                className="w-full py-3 px-4 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
              >
                {submitting ? 'Procesando...' : '↺ Desmarcar entrega (volver a pendiente)'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleMarcarEntregado}
              disabled={submitting}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {submitting ? 'Registrando...' : '✓ Confirmar Entrega de Medicamento'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}