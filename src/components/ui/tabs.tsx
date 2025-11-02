import * as React from 'react'
type TabsCtx = { value: string, setValue: (v:string)=>void }
const Ctx = React.createContext<TabsCtx | null>(null)
export function Tabs({ defaultValue, children }: { defaultValue: string, children: React.ReactNode }){
  const [value, setValue] = React.useState(defaultValue)
  return <Ctx.Provider value={{value,setValue}}>{children}</Ctx.Provider>
}
export function TabsList({ className='', children }: { className?: string, children: React.ReactNode }){
  return <div className={`inline-grid gap-2 rounded-2xl border p-1 bg-slate-100 ${className}`}>{children}</div>
}
export function TabsTrigger({ value, children }: { value: string, children: React.ReactNode }){
  const ctx = React.useContext(Ctx)!
  const active = ctx.value===value
  return <button onClick={()=>ctx.setValue(value)} className={`px-3 py-1 rounded-xl text-sm ${active?'bg-white shadow':'text-slate-600 hover:bg-white'}`}>{children}</button>
}
export function TabsContent({ value, className='', children }:{ value:string, className?:string, children:React.ReactNode }){
  const ctx = React.useContext(Ctx)!
  if (ctx.value!==value) return null
  return <div className={className}>{children}</div>
}