import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, CalendarClock, HeartPulse, Activity, Stethoscope, Brain, Plus, Trash2, Search } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import OpenAI from 'openai'

const DEEPSEEK_API_KEY = 'sk-34c1116b28e24ad4add008420062d489'

const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true
})

const MOCK_PATIENTS = [
  {
    id: 'P-001',
    name: 'Aisyah Binti Azman',
    age: 42,
    gender: 'F',
    tags: ['DM', 'HTN'],
    vitals: [
      { t: 'Mon', sys: 128, dia: 84, hr: 76, glu: 7.5, spo2: 97 },
      { t: 'Tue', sys: 131, dia: 86, hr: 79, glu: 7.2, spo2: 96 },
      { t: 'Wed', sys: 135, dia: 88, hr: 83, glu: 8.1, spo2: 97 },
      { t: 'Thu', sys: 139, dia: 90, hr: 82, glu: 8.3, spo2: 96 },
      { t: 'Fri', sys: 142, dia: 92, hr: 85, glu: 8.7, spo2: 95 },
    ],
    lastVisit: '2025-10-28',
  },
  {
    id: 'P-002',
    name: 'Muhammad Razif',
    age: 58,
    gender: 'M',
    tags: ['Hyperlipidemia'],
    vitals: [
      { t: 'Mon', sys: 120, dia: 78, hr: 72, glu: 5.5, spo2: 98 },
      { t: 'Tue', sys: 122, dia: 79, hr: 73, glu: 5.6, spo2: 98 },
      { t: 'Wed', sys: 121, dia: 80, hr: 74, glu: 5.5, spo2: 97 },
      { t: 'Thu', sys: 124, dia: 80, hr: 74, glu: 5.6, spo2: 98 },
      { t: 'Fri', sys: 125, dia: 81, hr: 75, glu: 5.7, spo2: 97 },
    ],
    lastVisit: '2025-10-21',
  },
  {
    id: 'P-003',
    name: 'Lim Wei Qi',
    age: 27,
    gender: 'F',
    tags: ['Asthma'],
    vitals: [
      { t: 'Mon', sys: 114, dia: 74, hr: 80, glu: 4.9, spo2: 94 },
      { t: 'Tue', sys: 116, dia: 75, hr: 82, glu: 5.0, spo2: 93 },
      { t: 'Wed', sys: 115, dia: 74, hr: 81, glu: 5.1, spo2: 95 },
      { t: 'Thu', sys: 118, dia: 76, hr: 83, glu: 5.1, spo2: 94 },
      { t: 'Fri', sys: 117, dia: 75, hr: 80, glu: 5.0, spo2: 96 },
    ],
    lastVisit: '2025-10-30',
  },
  {
    id: 'P-004',
    name: 'Rajesh Kumar',
    age: 65,
    gender: 'M',
    tags: ['COPD', 'HTN', 'Ex-smoker'],
    vitals: [
      { t: 'Mon', sys: 145, dia: 95, hr: 88, glu: 6.2, spo2: 89 },
      { t: 'Tue', sys: 148, dia: 96, hr: 90, glu: 6.3, spo2: 88 },
      { t: 'Wed', sys: 150, dia: 98, hr: 92, glu: 6.5, spo2: 87 },
      { t: 'Thu', sys: 152, dia: 99, hr: 91, glu: 6.4, spo2: 88 },
      { t: 'Fri', sys: 154, dia: 100, hr: 93, glu: 6.6, spo2: 86 },
    ],
    lastVisit: '2025-10-29',
  },
  {
    id: 'P-005',
    name: 'Siti',
    age: 34,
    gender: 'F',
    tags: ['Pregnancy', 'Gestational DM'],
    vitals: [
      { t: 'Mon', sys: 118, dia: 76, hr: 78, glu: 6.8, spo2: 98 },
      { t: 'Tue', sys: 120, dia: 78, hr: 80, glu: 7.1, spo2: 98 },
      { t: 'Wed', sys: 122, dia: 79, hr: 82, glu: 7.3, spo2: 97 },
      { t: 'Thu', sys: 124, dia: 80, hr: 84, glu: 7.5, spo2: 98 },
      { t: 'Fri', sys: 126, dia: 82, hr: 86, glu: 7.8, spo2: 97 },
    ],
    lastVisit: '2025-10-31',
  },
  {
    id: 'P-006',
    name: 'Chen Jia Wei',
    age: 19,
    gender: 'M',
    tags: ['Athlete', 'Sports Physical'],
    vitals: [
      { t: 'Mon', sys: 108, dia: 68, hr: 58, glu: 4.8, spo2: 99 },
      { t: 'Tue', sys: 110, dia: 70, hr: 60, glu: 4.9, spo2: 99 },
      { t: 'Wed', sys: 109, dia: 69, hr: 59, glu: 4.7, spo2: 100 },
      { t: 'Thu', sys: 112, dia: 71, hr: 61, glu: 5.0, spo2: 99 },
      { t: 'Fri', sys: 111, dia: 70, hr: 60, glu: 4.8, spo2: 99 },
    ],
    lastVisit: '2025-10-25',
  },
  {
    id: 'P-007',
    name: 'Naiemah Omar',
    age: 71,
    gender: 'F',
    tags: ['CHF', 'DM', 'CKD'],
    vitals: [
      { t: 'Mon', sys: 156, dia: 102, hr: 95, glu: 9.2, spo2: 91 },
      { t: 'Tue', sys: 158, dia: 104, hr: 97, glu: 9.5, spo2: 90 },
      { t: 'Wed', sys: 162, dia: 106, hr: 99, glu: 9.8, spo2: 89 },
      { t: 'Thu', sys: 165, dia: 108, hr: 101, glu: 10.1, spo2: 88 },
      { t: 'Fri', sys: 168, dia: 110, hr: 103, glu: 10.5, spo2: 87 },
    ],
    lastVisit: '2025-11-01',
  },
]

const riskColor = (level: string) => ({
  Low: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-rose-100 text-rose-700',
} as any)[level] || 'bg-slate-100 text-slate-700'

function computeRisk(patient: any) {
  const last = patient.vitals[patient.vitals.length - 1]
  let score = 0
  score += Math.max(0, last.sys - 130) * 0.6
  score += Math.max(0, last.glu - 6.5) * 6
  score += Math.max(0, 95 - last.spo2) * 3  // Low oxygen saturation increases risk
  score += (patient.age > 50 ? 8 : 0)
  const level = score > 20 ? 'High' : score > 10 ? 'Medium' : 'Low'
  const confidence = Math.min(95, 60 + Math.round(score))
  const nextStep = level === 'High'
    ? 'Schedule urgent follow-up in 48h; order HbA1c + ABPM'
    : level === 'Medium'
    ? 'Book check-up in 1–2 weeks; lifestyle counselling'
    : 'Maintain routine monitoring; no immediate action'
  return { score: Math.round(score), level, confidence, nextStep }
}

export default function App(){
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState(MOCK_PATIENTS as any[])
  const [selectedId, setSelectedId] = useState(patients[0].id)
  const [tasks, setTasks] = useState([{ id: 'T-101', text: 'Call P-001 to confirm fasting blood test', priority: 'High' }])
  const [chat, setChat] = useState([{ role: 'assistant', text: 'Hi! I can predict risk and suggest next actions. Select a patient to begin.' }])
  const [taskPriority, setTaskPriority] = useState('Normal')

  const filtered = useMemo(()=>patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase())), [query, patients])
  const patient = useMemo(()=>patients.find(p => p.id === selectedId)!, [patients, selectedId])
  const risk = useMemo(()=> computeRisk(patient), [patient])

  /**
   * Add a new task - simplified without department routing
   */
  function addTask(text: string, priority: string){
    const newTask = {
      id: `T-${Date.now()}`,
      text,
      priority
    }
    setTasks(prev => [newTask, ...prev])
  }
  function handlePredict(){
    const msg = `Prediction for ${patient.name} (${patient.id}): Risk ${risk.level} (confidence ${risk.confidence}%). Suggested: ${risk.nextStep}.`
    setChat(c => [...c, { role: 'assistant', text: msg }])
    if (risk.level !== 'Low') addTask(risk.nextStep, risk.level)
  }
  async function handleAsk(prompt?: string){
    if (!prompt?.trim()) return
    setChat(c => [...c, { role: 'user', text: prompt }])
    
    try {
      // Add a loading message
      setChat(c => [...c, { role: 'assistant', text: 'Thinking...' }])
      
      const latestVitals = patient.vitals[patient.vitals.length - 1]
      const context = `You are a helpful medical assistant bot. Current patient: ${patient.name} (${patient.id}), Age: ${patient.age}, Conditions: ${patient.tags.join(', ')}. Current risk level: ${risk.level} (${risk.confidence}% confidence). Latest vitals - BP: ${latestVitals.sys}/${latestVitals.dia}, HR: ${latestVitals.hr}, Glucose: ${latestVitals.glu} mmol/L, SpO2: ${latestVitals.spo2}%.`
      
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
      
      const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      
      // Replace the loading message with the actual response
      setChat(c => {
        const newChat = [...c]
        newChat[newChat.length - 1] = { role: 'assistant', text: reply }
        return newChat
      })
    } catch (error) {
      console.error('DeepSeek API error:', error)
      setChat(c => {
        const newChat = [...c]
        newChat[newChat.length - 1] = { role: 'assistant', text: 'Sorry, there was an error connecting to the Helper Bot. Please try again.' }
        return newChat
      })
    }
  }

return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8" />
            <h1 className="text-2xl md:text-3xl font-semibold">Predictive AI Clinic Assistant</h1>
          </div>
        </div>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" /> Patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
             <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or ID" />
              <Button variant="secondary"><Search className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
              {filtered.map(p => {
                const r = computeRisk(p)
                return (
                  <button key={p.id} onClick={()=>setSelectedId(p.id)} className={`w-full text-left p-3 rounded-2xl border transition hover:bg-sky-50 ${selectedId===p.id?'border-sky-300 bg-sky-50':'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{p.name}</div>
                      <Badge className={riskColor(r.level)}>{r.level}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{p.id} • Age {p.age} • Last visit {p.lastVisit}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {p.tags.map((t:string) => <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>)}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> {patient.name} <span className="text-sm font-normal text-slate-500">({patient.id})</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="bp">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="bp">BP</TabsTrigger>
                  <TabsTrigger value="hr">Heart Rate</TabsTrigger>
                  <TabsTrigger value="glu">Glucose</TabsTrigger>
                  <TabsTrigger value="spo2">SpO2</TabsTrigger>
                </TabsList>
                <TabsContent value="bp" className="mt-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={patient.vitals} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="currentColor" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="t" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="sys" name="Systolic" stroke="currentColor" fillOpacity={1} fill="url(#g1)" />
                        <Line type="monotone" dataKey="dia" name="Diastolic" stroke="currentColor" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="hr" className="mt-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={patient.vitals}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="t" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="hr" name="Heart rate" stroke="currentColor" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="glu" className="mt-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={patient.vitals}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="t" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="glu" name="Glucose" stroke="currentColor" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="spo2" className="mt-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={patient.vitals}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="t" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="spo2" name="SpO2 %" stroke="currentColor" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 border">
                  <div className="text-xs text-slate-500 mb-1">Risk level</div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className={`px-2 py-1 rounded-full ${riskColor(risk.level)}`}>{risk.level}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border">
                  <div className="text-xs text-slate-500 mb-1">Risk score</div>
                  <div className="text-lg font-semibold">{risk.score}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border">
                  <div className="text-xs text-slate-500 mb-1">Confidence</div>
                  <div className="text-lg font-semibold">{risk.confidence}%</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border p-4">
                <div className="text-sm text-slate-600">Suggested next step</div>
                <div className="font-medium mt-1">{risk.nextStep}</div>
                <div className="mt-3 flex items-center gap-3">
                  <Button onClick={handlePredict} className="rounded-2xl"><CalendarClock className="h-4 w-4 mr-2"/>Predict & Add Task</Button>
                  <div className="text-xs text-slate-500">(Adds to Task Queue if Medium/High)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Task Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Input id="taskText" placeholder="Add a task e.g. Order HbA1c" />
                <div className="flex gap-2">
                  <Select defaultValue={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Priority"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={()=>{
                    const el = document.getElementById('taskText') as HTMLInputElement | null
                    if (!el) return
                    const text = el.value.trim()
                    if (!text) return
                    addTask(text, taskPriority)
                    el.value = ''
                  }}><Plus className="h-4 w-4 mr-2"/>Add Task</Button>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-2 max-h-[32vh] overflow-auto pr-1">
                {tasks.map((t:any) => (
                  <div key={t.id} className="flex items-start justify-between p-3 rounded-2xl border bg-white">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t.text}</div>
                      <div className="text-xs text-slate-500 mt-1">{t.id}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="outline" className="rounded-full">{t.priority}</Badge>
                      <Button size="icon" variant="ghost" onClick={()=>setTasks((ts:any[])=>ts.filter(x=>x.id!==t.id))}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center text-sm text-slate-400 py-4">
                    No tasks yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Helper Bot </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-[32vh] overflow-auto space-y-2 pr-1">
                {chat.map((m:any, i:number) => (
                  <div key={i} className={`p-3 rounded-2xl border ${m.role==='assistant'?'bg-slate-50':'bg-white'}`}>
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{m.role}</div>
                    <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Textarea id="chatInput" placeholder="Ask the helper bot e.g. explain risk factors…"/>
                <div className="flex gap-2">
                  <Button onClick={()=>{
                    const el = document.getElementById('chatInput') as HTMLTextAreaElement | null
                    if (!el) return
                    const val = el.value
                    // @ts-ignore
                    handleAsk(val)
                    el.value = ''
                  }}><Plus className="h-4 w-4 mr-2"/>Send</Button>
                  <Button variant="secondary" onClick={handlePredict}>Quick Predict</Button>
                </div>
                <div className="text-[10px] text-slate-500">Powered by DeepSeek AI. Responses are generated in real-time.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-12 text-center text-xs text-slate-500 mt-2">
          © 2025 Predictive AI Clinic Assistant
        </div>
      </div>
    </div>
  )
}