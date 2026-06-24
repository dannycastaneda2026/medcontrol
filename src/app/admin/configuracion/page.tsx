'use client'

import { useState } from 'react'
import { 
  UserPlus, 
  Users, 
  Baby, 
  Pill, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import UsuarioForm from './components/UsuarioForm'
import ApoderadoForm from './components/ApoderadoForm'
import AlumnoForm from './components/AlumnoForm'
import OrdenForm from './components/OrdenForm'
import HorarioForm from './components/HorarioForm'

type Step = 'usuario' | 'apoderado' | 'alumno' | 'orden' | 'horario'

interface UserData {
  rut: string
  nombre_completo: string
  email: string
}

export default function ConfiguracionPage() {
  const [activeStep, setActiveStep] = useState<Step>('usuario')
  const [success, setSuccess] = useState('')

  const [ids, setIds] = useState({
    userId: 0,
    apoderadoId: 0,
    alumnoId: 0,
    ordenId: 0,
  })

  const [userData, setUserData] = useState<UserData>({ rut: '', nombre_completo: '', email: '' })

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleUsuarioSuccess = (userId: number, data: UserData) => {
    setIds(prev => ({ ...prev, userId }))
    setUserData(data)
    showSuccess(`✓ Usuario creado correctamente`)
    setActiveStep('apoderado')
  }

  const handleApoderadoSuccess = (apoderadoId: number) => {
    setIds(prev => ({ ...prev, apoderadoId }))
    showSuccess(`✓ Apoderado vinculado`)
    setActiveStep('alumno')
  }

  const handleAlumnoSuccess = (alumnoId: number) => {
    setIds(prev => ({ ...prev, alumnoId }))
    showSuccess(`✓ Alumno creado`)
    setActiveStep('orden')
  }

  const handleOrdenSuccess = (ordenId: number) => {
    setIds(prev => ({ ...prev, ordenId }))
    showSuccess(`✓ Orden médica creada`)
    setActiveStep('horario')
  }

  const handleHorarioSuccess = () => {
    showSuccess(`✓ Horario creado. Entregas generadas automáticamente!`)
    // Reset
    setIds({ userId: 0, apoderadoId: 0, alumnoId: 0, ordenId: 0 })
    setUserData({ rut: '', nombre_completo: '', email: '' })
    setActiveStep('usuario')
  }

  const steps = [
    { key: 'usuario' as Step, title: '1. Crear Usuario', icon: UserPlus, complete: ids.userId > 0 },
    { key: 'apoderado' as Step, title: '2. Datos del Apoderado', icon: Users, complete: ids.apoderadoId > 0 },
    { key: 'alumno' as Step, title: '3. Crear Alumno', icon: Baby, complete: ids.alumnoId > 0 },
    { key: 'orden' as Step, title: '4. Crear Orden Médica', icon: Pill, complete: ids.ordenId > 0 },
    { key: 'horario' as Step, title: '5. Crear Horario', icon: Clock, complete: false },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración Rápida</h1>
        <p className="text-gray-500 mt-1">Crea usuarios, apoderados, alumnos y órdenes médicas paso a paso</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon
          const isActive = activeStep === step.key
          
          return (
            <div 
              key={step.key}
              className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${
                isActive ? 'border-blue-500 ring-1 ring-blue-500' : 
                step.complete ? 'border-green-200' : 'border-gray-100'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveStep(step.key)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    step.complete ? 'bg-green-100' : 
                    isActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {step.complete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {step.complete ? 'Completado ✓' : isActive ? 'En progreso...' : 'Pendiente'}
                    </p>
                  </div>
                </div>
                {isActive ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              
              {isActive && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  {step.key === 'usuario' && <UsuarioForm onSuccess={handleUsuarioSuccess} />}
                  {step.key === 'apoderado' && ids.userId > 0 && (
                    <ApoderadoForm userId={ids.userId} userData={userData} onSuccess={handleApoderadoSuccess} />
                  )}
                  {step.key === 'apoderado' && ids.userId === 0 && (
                    <p className="text-gray-500 text-center py-4">Primero debes crear un usuario.</p>
                  )}
                  {step.key === 'alumno' && ids.apoderadoId > 0 && (
                    <AlumnoForm apoderadoId={ids.apoderadoId} onSuccess={handleAlumnoSuccess} />
                  )}
                  {step.key === 'alumno' && ids.apoderadoId === 0 && (
                    <p className="text-gray-500 text-center py-4">Primero debes completar los datos del apoderado.</p>
                  )}
                  {step.key === 'orden' && ids.alumnoId > 0 && (
                    <OrdenForm alumnoId={ids.alumnoId} onSuccess={handleOrdenSuccess} />
                  )}
                  {step.key === 'orden' && ids.alumnoId === 0 && (
                    <p className="text-gray-500 text-center py-4">Primero debes crear un alumno.</p>
                  )}
                  {step.key === 'horario' && ids.ordenId > 0 && (
                    <HorarioForm ordenId={ids.ordenId} onSuccess={handleHorarioSuccess} />
                  )}
                  {step.key === 'horario' && ids.ordenId === 0 && (
                    <p className="text-gray-500 text-center py-4">Primero debes crear una orden médica.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}