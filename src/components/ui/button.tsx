import * as React from 'react'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'secondary'|'ghost', size?: 'default'|'icon' }
export function Button({ className='', variant='default', size='default', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-2xl border text-sm font-medium transition focus:outline-none px-4 h-10'
  const variantCls = {
    default: 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700',
    secondary: 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100'
  }[variant]
  const sizeCls = size==='icon' ? 'w-10 h-10 p-0' : ''
  return <button className={[base, variantCls, sizeCls, className].join(' ')} {...props} />
}