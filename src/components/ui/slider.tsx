import * as React from 'react'
type Props = { value: number[], min?: number, max?: number, step?: number, onValueChange?: (v:number[])=>void, className?: string }
export function Slider({ value, min=0, max=100, step=1, onValueChange, className='' }: Props){
  const v = value?.[0] ?? min
  return (
    <input
      type="range"
      className={`w-full ${className}`}
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e)=> onValueChange && onValueChange([Number(e.target.value)])}
    />
  )
}