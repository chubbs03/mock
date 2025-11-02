import * as React from 'react'
type CtxT = { items: { value:string, label:string }[], setItems: React.Dispatch<React.SetStateAction<{value:string,label:string}[]>>, onChange?: (v:string)=>void, value?: string }
const Ctx = React.createContext<CtxT | null>(null)

export function Select({ defaultValue, onValueChange, children }:{ defaultValue?: string, onValueChange?: (v:string)=>void, children: React.ReactNode }){
  const [items, setItems] = React.useState<{value:string,label:string}[]>([])
  const [value, setValue] = React.useState<string | undefined>(defaultValue)
  return (
    <Ctx.Provider value={{ items, setItems, onChange: (v)=>{ setValue(v); onValueChange && onValueChange(v) }, value }}>
      <div className="relative inline-flex items-center gap-2">
        {children}
        <select
          className="rounded-2xl border px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-sky-400"
          value={value}
          onChange={(e)=>{ const v = e.target.value; setValue(v); onValueChange && onValueChange(v) }}>
          {items.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
        </select>
      </div>
    </Ctx.Provider>
  )
}

export function SelectTrigger({ className='', children }:{ className?: string, children?: React.ReactNode }){
  return <div className={className} style={{display:'none'}}>{children}</div>
}
export function SelectValue({ placeholder }:{ placeholder?: string }){ return <span style={{display:'none'}}>{placeholder}</span> }

export function SelectContent({ children }:{ children: React.ReactNode }){ return <div style={{display:'none'}}>{children}</div> }

export function SelectItem({ value, children }:{ value:string, children: React.ReactNode }){
  const ctx = React.useContext(Ctx)!
  React.useEffect(()=>{
    const label = typeof children === 'string' ? children : String(value)
    ctx.setItems(prev => prev.some(i=>i.value===value) ? prev : [...prev, { value, label }])
  }, [value, children])
  return null
}