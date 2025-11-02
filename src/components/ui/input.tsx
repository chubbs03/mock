import * as React from 'react'
export function Input({ className='', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full rounded-2xl border px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-sky-400 ${className}`} {...props} />
}