'use client'

import { useEffect, useState } from 'react'

const formatClock = (date: Date) =>
  date.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

export default function LiveClock() {
  const [time, setTime] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(formatClock(new Date()))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
      <span className="text-slate-500">Hora actual</span>
      <span className="font-semibold">{time}</span>
    </div>
  )
}
