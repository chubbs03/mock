import * as React from 'react'
type Props = React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default'|'outline' }
export function Badge({ className='', variant='default', ...props }: Props) {
  const base = variant==='outline' ? 'border border-slate-300 text-slate-700' : 'bg-slate-800 text-white'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${base} ${className}`} {...props} />
}