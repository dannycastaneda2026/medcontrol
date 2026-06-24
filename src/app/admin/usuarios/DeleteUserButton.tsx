'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: number
}

export default function DeleteUserButton({ userId }: Props) {
  const [status, setStatus] = useState<'idle' | 'deleting' | 'deleted' | 'error'>('idle')
  const router = useRouter()

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Se eliminarán también los apoderados y alumnos vinculados. Esta acción no se puede deshacer.')) {
      return
    }

    setStatus('deleting')

    try {
      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'No se pudo eliminar el usuario')
      }

      setStatus('deleted')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setStatus('error')
      window.alert(message || 'Error eliminando el usuario')
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={status === 'deleting' || status === 'deleted'}
      className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {status === 'deleting' ? 'Eliminando...' : status === 'deleted' ? 'Eliminado' : 'Eliminar'}
    </button>
  )
}
