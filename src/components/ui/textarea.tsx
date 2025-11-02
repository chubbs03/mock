import * as React from 'react'
export function Textarea({ className='', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`w-full rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-sky-400 ${className}`} {...props} />
}