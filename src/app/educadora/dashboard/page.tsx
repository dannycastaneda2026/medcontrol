import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Pill, 
  CalendarDays,
  User,
  ChevronRight,
  Activity
} from 'lucide-react'
import LiveClock from '@/components/LiveClock'
import DashboardAutoRefresh from '@/components/DashboardAutoRefresh'

type EntregaEducadora = {
  id_entrega: number
  fecha_entrega: string
  entregado: boolean
  hora_entrega_real: string | null
  observaciones_entrega: string | null
  id_horario: number
  horarios_medicacion?: Array<{
    id_horario: number
    hora_administracion?: string | null
    observaciones?: string | null
    id_orden: number
    ordenes_medicas?: Array<{
      id_orden: number
      nombre_farmaco: string
      dosis: string
      id_alumno: number
      alumnos?: Array<{
        id_alumno: number
        nombre: string
        apellidos: string
        nivel_educativo: string
      }>
    }>
  }>
}

export default async function EducadoraDashboard() {
  const supabase = await createClient()
  
  const hoy = new Date().toISOString().split('T')[0]
  const fechaFormateada = new Date().toLocaleDateString('es-CL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Obtener entregas del día
  const { data: entregas, error } = await supabase
    .from('entregas_medicamentos')
    .select(`
      id_entrega,
      fecha_entrega,
      entregado,
      hora_entrega_real,
      observaciones_entrega,
      id_horario,
      horarios_medicacion!inner (
        id_horario,
        hora_administracion,
        observaciones,
        id_orden,
        ordenes_medicas!inner (
          id_orden,
          nombre_farmaco,
          dosis,
          id_alumno,
          alumnos!inner (
            id_alumno,
            nombre,
            apellidos,
            nivel_educativo
          )
        )
      )
    `)
    .eq('fecha_entrega', hoy)
    .order('entregado', { ascending: true })

  if (error) {
    console.error('Error al cargar entregas:', error)
  }

  // Ordenar manualmente por hora
  const entregasOrdenadas = entregas?.sort((a, b) => {
    const horaA = a.horarios_medicacion?.[0]?.hora_administracion || '00:00'
    const horaB = b.horarios_medicacion?.[0]?.hora_administracion || '00:00'
    return horaA.localeCompare(horaB)
  }) || []

  const pendientes = entregasOrdenadas.filter((e) => !e.entregado)
  const completadas = entregasOrdenadas.filter((e) => e.entregado)
  const totalEntregas = entregasOrdenadas.length
  const porcentajeCompletado = totalEntregas > 0 
    ? Math.round((completadas.length / totalEntregas) * 100) 
    : 0

  return (
    <div>
      <DashboardAutoRefresh />
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-500 text-sm mb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span className="capitalize">{fechaFormateada}</span>
          </div>
          <LiveClock />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Entregas de Medicamentos</h1>
        <p className="text-gray-500 mt-1">Gestiona las dosis programadas para hoy</p>
      </div>

      {/* Stats Cards */}
      {totalEntregas > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Entregas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalEntregas}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{pendientes.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completadas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{completadas.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Progreso</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{porcentajeCompletado}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${porcentajeCompletado}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pendientes Section */}
      {pendientes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-gray-900">
              Pendientes ({pendientes.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendientes.map((entrega) => (
              <EntregaPendienteCard key={entrega.id_entrega} entrega={entrega} />
            ))}
          </div>
        </div>
      )}

      {/* Completadas Section */}
      {completadas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Entregadas ({completadas.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completadas.map((entrega) => (
              <EntregaCompletadaCard key={entrega.id_entrega} entrega={entrega} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalEntregas === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Pill className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay entregas programadas
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-2">
            No hay medicamentos pendientes para hoy. Las entregas se generan automáticamente cuando se crean órdenes médicas con horarios.
          </p>
          <div className="text-sm text-gray-400 mt-4">
            Fecha: {fechaFormateada}
          </div>
        </div>
      )}
    </div>
  )
}

// Card para entregas pendientes
function EntregaPendienteCard({ entrega }: { entrega: EntregaEducadora }) {
  const horario = entrega.horarios_medicacion?.[0]
  const orden = horario?.ordenes_medicas?.[0]
  const alumno = orden?.alumnos?.[0]

  const hora = horario?.hora_administracion?.slice(0, 5) || '--:--'

  return (
    <Link 
      href={`/educadora/entregas/${entrega.id_entrega}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all duration-200"
    >
      <div className="p-5">
        {/* Header: Hora y Estado */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{hora}</div>
              <div className="text-xs text-gray-500">Programado</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            Pendiente
          </span>
        </div>

        {/* Info del Alumno */}
        <div className="flex items-start gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {alumno?.nombre} {alumno?.apellidos}
            </div>
            <div className="text-sm text-gray-500">{alumno?.nivel_educativo}</div>
          </div>
        </div>

        {/* Medicamento */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">{orden?.nombre_farmaco}</span>
          </div>
          <div className="text-sm text-gray-600 ml-6">
            Dosis: {orden?.dosis}
          </div>
        </div>

        {/* Observaciones */}
        {horario?.observaciones && (
          <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{horario.observaciones}</span>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-green-600 group-hover:text-green-700">
            Marcar entregado
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

// Card para entregas completadas
function EntregaCompletadaCard({ entrega }: { entrega: EntregaEducadora }) {
  const horario = entrega.horarios_medicacion?.[0]
  const orden = horario?.ordenes_medicas?.[0]
  const alumno = orden?.alumnos?.[0]

  const hora = horario?.hora_administracion?.slice(0, 5) || '--:--'
  const horaEntrega = entrega.hora_entrega_real 
    ? new Date(entrega.hora_entrega_real).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 opacity-75">
      <div className="p-5">
        {/* Header: Hora y Estado */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{hora}</div>
              <div className="text-xs text-gray-500">Programado</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Entregado
          </span>
        </div>

        {/* Info del Alumno */}
        <div className="flex items-start gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="font-semibold text-gray-700">
              {alumno?.nombre} {alumno?.apellidos}
            </div>
            <div className="text-sm text-gray-500">{alumno?.nivel_educativo}</div>
          </div>
        </div>

        {/* Medicamento */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">{orden?.nombre_farmaco}</span>
          </div>
          <div className="text-sm text-gray-600 ml-6">
            Dosis: {orden?.dosis}
          </div>
        </div>

        {/* Hora real de entrega */}
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>Entregado a las {horaEntrega}</span>
        </div>

        {/* Observaciones de entrega */}
        {entrega.observaciones_entrega && (
          <div className="mt-2 text-sm text-gray-500 bg-gray-50 rounded p-2">
            📝 {entrega.observaciones_entrega}
          </div>
        )}
      </div>
    </div>
  )
}