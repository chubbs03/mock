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

// Patient data loaded from Hugging Face dataset: madushan99/patient-clinical-letters
// ALL 60 patients with complete diagnostic information and generated vital signs
const MOCK_PATIENTS = [
  {
    "id": "P-001",
    "name": "Juana Brandt",
    "age": 66,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "intermedaite-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "intermedaite",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "parascapusular",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 136,
        "dia": 88,
        "hr": 83,
        "glu": 5.0,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 137,
        "dia": 90,
        "hr": 86,
        "glu": 5.3,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 142,
        "dia": 91,
        "hr": 76,
        "glu": 5.3,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 137,
        "dia": 90,
        "hr": 85,
        "glu": 5.2,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 139,
        "dia": 92,
        "hr": 84,
        "glu": 5.5,
        "spo2": 93
      }
    ],
    "lastVisit": "2025-11-01"
  },
  {
    "id": "P-002",
    "name": "Sara Frye",
    "age": 63,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "parascapusular",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 155,
        "dia": 92,
        "hr": 91,
        "glu": 7.0,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 158,
        "dia": 95,
        "hr": 91,
        "glu": 7.0,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 155,
        "dia": 94,
        "hr": 94,
        "glu": 7.3,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 156,
        "dia": 93,
        "hr": 91,
        "glu": 7.2,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 158,
        "dia": 92,
        "hr": 86,
        "glu": 7.1,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-02"
  },
  {
    "id": "P-003",
    "name": "Victoria Luna",
    "age": 54,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left thigh",
      "status": "D",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 139,
        "dia": 90,
        "hr": 87,
        "glu": 5.4,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 143,
        "dia": 90,
        "hr": 88,
        "glu": 5.4,
        "spo2": 93
      },
      {
        "t": "Wed",
        "sys": 143,
        "dia": 94,
        "hr": 89,
        "glu": 5.8,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 149,
        "dia": 91,
        "hr": 91,
        "glu": 5.9,
        "spo2": 93
      },
      {
        "t": "Fri",
        "sys": 150,
        "dia": 92,
        "hr": 91,
        "glu": 6.2,
        "spo2": 93
      }
    ],
    "lastVisit": "2025-11-03"
  },
  {
    "id": "P-004",
    "name": "Jenna Peterson",
    "age": 22,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right buttock",
      "status": "D",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 112,
        "dia": 78,
        "hr": 80,
        "glu": 6.0,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 109,
        "dia": 77,
        "hr": 88,
        "glu": 6.4,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 113,
        "dia": 78,
        "hr": 90,
        "glu": 6.5,
        "spo2": 93
      },
      {
        "t": "Thu",
        "sys": 113,
        "dia": 80,
        "hr": 87,
        "glu": 6.8,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 117,
        "dia": 81,
        "hr": 85,
        "glu": 6.9,
        "spo2": 92
      }
    ],
    "lastVisit": "2025-11-04"
  },
  {
    "id": "P-005",
    "name": "Rita Smith",
    "age": 54,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 139,
        "dia": 90,
        "hr": 83,
        "glu": 6.0,
        "spo2": 88
      },
      {
        "t": "Tue",
        "sys": 143,
        "dia": 93,
        "hr": 83,
        "glu": 6.1,
        "spo2": 86
      },
      {
        "t": "Wed",
        "sys": 140,
        "dia": 91,
        "hr": 93,
        "glu": 6.0,
        "spo2": 87
      },
      {
        "t": "Thu",
        "sys": 141,
        "dia": 93,
        "hr": 91,
        "glu": 6.0,
        "spo2": 88
      },
      {
        "t": "Fri",
        "sys": 140,
        "dia": 92,
        "hr": 89,
        "glu": 6.0,
        "spo2": 87
      }
    ],
    "lastVisit": "2025-11-05"
  },
  {
    "id": "P-006",
    "name": "Audrey Krueger",
    "age": 63,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "pleiomorphic spindle"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic spindle cell undifferentiated",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 151,
        "dia": 92,
        "hr": 94,
        "glu": 6.7,
        "spo2": 87
      },
      {
        "t": "Tue",
        "sys": 150,
        "dia": 92,
        "hr": 88,
        "glu": 6.7,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 153,
        "dia": 95,
        "hr": 89,
        "glu": 6.7,
        "spo2": 88
      },
      {
        "t": "Thu",
        "sys": 151,
        "dia": 92,
        "hr": 90,
        "glu": 7.1,
        "spo2": 86
      },
      {
        "t": "Fri",
        "sys": 152,
        "dia": 94,
        "hr": 88,
        "glu": 7.1,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-11-06"
  },
  {
    "id": "P-007",
    "name": "Virginia Johnson",
    "age": 58,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Synovial sarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "poorly differentiated synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "D",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 152,
        "dia": 95,
        "hr": 93,
        "glu": 6.2,
        "spo2": 90
      },
      {
        "t": "Tue",
        "sys": 157,
        "dia": 98,
        "hr": 95,
        "glu": 6.6,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 157,
        "dia": 98,
        "hr": 89,
        "glu": 6.7,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 163,
        "dia": 101,
        "hr": 93,
        "glu": 7.0,
        "spo2": 88
      },
      {
        "t": "Fri",
        "sys": 162,
        "dia": 100,
        "hr": 96,
        "glu": 7.0,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-11-07"
  },
  {
    "id": "P-008",
    "name": "Connie Bailey",
    "age": 38,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left biceps",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 127,
        "dia": 77,
        "hr": 87,
        "glu": 5.6,
        "spo2": 92
      },
      {
        "t": "Tue",
        "sys": 132,
        "dia": 74,
        "hr": 90,
        "glu": 5.5,
        "spo2": 90
      },
      {
        "t": "Wed",
        "sys": 127,
        "dia": 74,
        "hr": 84,
        "glu": 5.5,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 132,
        "dia": 77,
        "hr": 89,
        "glu": 5.5,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 128,
        "dia": 74,
        "hr": 84,
        "glu": 5.7,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-08"
  },
  {
    "id": "P-009",
    "name": "Susan Taylor",
    "age": 83,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "left thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 153,
        "dia": 97,
        "hr": 98,
        "glu": 6.4,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 159,
        "dia": 97,
        "hr": 94,
        "glu": 6.2,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 154,
        "dia": 97,
        "hr": 95,
        "glu": 6.4,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 154,
        "dia": 98,
        "hr": 101,
        "glu": 6.4,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 154,
        "dia": 95,
        "hr": 100,
        "glu": 6.6,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-11-09"
  },
  {
    "id": "P-010",
    "name": "Charlene Stevens",
    "age": 61,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "poorly differentiated synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 141,
        "dia": 95,
        "hr": 104,
        "glu": 6.6,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 140,
        "dia": 95,
        "hr": 101,
        "glu": 6.5,
        "spo2": 90
      },
      {
        "t": "Wed",
        "sys": 146,
        "dia": 97,
        "hr": 96,
        "glu": 6.8,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 147,
        "dia": 96,
        "hr": 103,
        "glu": 6.8,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 142,
        "dia": 100,
        "hr": 103,
        "glu": 6.8,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-10"
  },
  {
    "id": "P-011",
    "name": "Jordan Hudson",
    "age": 43,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "myxoid fibrosarcoma"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "myxoid fibrosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 141,
        "dia": 87,
        "hr": 91,
        "glu": 6.2,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 144,
        "dia": 85,
        "hr": 94,
        "glu": 6.5,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 143,
        "dia": 88,
        "hr": 98,
        "glu": 6.6,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 145,
        "dia": 89,
        "hr": 94,
        "glu": 6.9,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 143,
        "dia": 87,
        "hr": 99,
        "glu": 6.9,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-11"
  },
  {
    "id": "P-012",
    "name": "Jeffrey Boyd",
    "age": 49,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "sclerosing epithelio"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "sclerosing epithelioid fibrosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 132,
        "dia": 85,
        "hr": 88,
        "glu": 5.3,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 134,
        "dia": 85,
        "hr": 90,
        "glu": 5.4,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 137,
        "dia": 88,
        "hr": 91,
        "glu": 5.6,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 132,
        "dia": 88,
        "hr": 88,
        "glu": 6.0,
        "spo2": 89
      },
      {
        "t": "Fri",
        "sys": 138,
        "dia": 87,
        "hr": 88,
        "glu": 6.0,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-11-12"
  },
  {
    "id": "P-013",
    "name": "David Salazar",
    "age": 44,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "pleiomorphic spindle",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic spindle cell undifferentiated",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 145,
        "dia": 84,
        "hr": 93,
        "glu": 6.6,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 140,
        "dia": 86,
        "hr": 89,
        "glu": 6.5,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 143,
        "dia": 83,
        "hr": 91,
        "glu": 6.5,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 140,
        "dia": 88,
        "hr": 94,
        "glu": 6.5,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 145,
        "dia": 84,
        "hr": 87,
        "glu": 6.8,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-13"
  },
  {
    "id": "P-014",
    "name": "Sarah Wilcox",
    "age": 62,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 147,
        "dia": 92,
        "hr": 98,
        "glu": 5.6,
        "spo2": 94
      },
      {
        "t": "Tue",
        "sys": 150,
        "dia": 89,
        "hr": 91,
        "glu": 5.5,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 144,
        "dia": 89,
        "hr": 98,
        "glu": 5.6,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 150,
        "dia": 93,
        "hr": 93,
        "glu": 5.8,
        "spo2": 93
      },
      {
        "t": "Fri",
        "sys": 147,
        "dia": 91,
        "hr": 89,
        "glu": 5.8,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-14"
  },
  {
    "id": "P-015",
    "name": "Linda Riley",
    "age": 64,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "malignant solitary f",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "malignant solitary fibrous tumor",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 135,
        "dia": 92,
        "hr": 89,
        "glu": 6.2,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 138,
        "dia": 91,
        "hr": 93,
        "glu": 6.2,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 135,
        "dia": 91,
        "hr": 96,
        "glu": 6.2,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 136,
        "dia": 92,
        "hr": 92,
        "glu": 6.3,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 137,
        "dia": 93,
        "hr": 90,
        "glu": 6.2,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-15"
  },
  {
    "id": "P-016",
    "name": "Mark Greene",
    "age": 74,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "undifferentiated ple"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "undifferentiated pleomorphic liposarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 167,
        "dia": 100,
        "hr": 80,
        "glu": 7.1,
        "spo2": 89
      },
      {
        "t": "Tue",
        "sys": 163,
        "dia": 100,
        "hr": 84,
        "glu": 7.2,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 163,
        "dia": 97,
        "hr": 85,
        "glu": 6.9,
        "spo2": 88
      },
      {
        "t": "Thu",
        "sys": 168,
        "dia": 99,
        "hr": 83,
        "glu": 7.4,
        "spo2": 86
      },
      {
        "t": "Fri",
        "sys": 168,
        "dia": 102,
        "hr": 82,
        "glu": 7.4,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-11-16"
  },
  {
    "id": "P-017",
    "name": "Joseph Moore",
    "age": 42,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "undifferentiated ple"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "undifferentiated pleomorphic liposarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left buttock",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 146,
        "dia": 90,
        "hr": 88,
        "glu": 6.1,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 146,
        "dia": 92,
        "hr": 86,
        "glu": 6.5,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 143,
        "dia": 91,
        "hr": 86,
        "glu": 6.6,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 145,
        "dia": 93,
        "hr": 80,
        "glu": 6.6,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 148,
        "dia": 95,
        "hr": 87,
        "glu": 6.7,
        "spo2": 92
      }
    ],
    "lastVisit": "2025-11-17"
  },
  {
    "id": "P-018",
    "name": "Laurie Smith",
    "age": 80,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 150,
        "dia": 99,
        "hr": 91,
        "glu": 5.7,
        "spo2": 92
      },
      {
        "t": "Tue",
        "sys": 155,
        "dia": 98,
        "hr": 94,
        "glu": 5.7,
        "spo2": 90
      },
      {
        "t": "Wed",
        "sys": 153,
        "dia": 97,
        "hr": 98,
        "glu": 5.8,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 155,
        "dia": 100,
        "hr": 93,
        "glu": 5.6,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 152,
        "dia": 101,
        "hr": 91,
        "glu": 5.7,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-18"
  },
  {
    "id": "P-019",
    "name": "Dr. Diana Davis",
    "age": 30,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 115,
        "dia": 77,
        "hr": 97,
        "glu": 5.9,
        "spo2": 94
      },
      {
        "t": "Tue",
        "sys": 118,
        "dia": 76,
        "hr": 90,
        "glu": 6.0,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 115,
        "dia": 78,
        "hr": 100,
        "glu": 6.0,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 113,
        "dia": 78,
        "hr": 90,
        "glu": 6.2,
        "spo2": 93
      },
      {
        "t": "Fri",
        "sys": 117,
        "dia": 79,
        "hr": 90,
        "glu": 6.2,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-19"
  },
  {
    "id": "P-020",
    "name": "Mrs. Linda Thomas MD",
    "age": 67,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Synovial sarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 146,
        "dia": 100,
        "hr": 104,
        "glu": 6.7,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 147,
        "dia": 104,
        "hr": 98,
        "glu": 6.5,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 144,
        "dia": 101,
        "hr": 100,
        "glu": 6.8,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 145,
        "dia": 101,
        "hr": 108,
        "glu": 6.7,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 146,
        "dia": 105,
        "hr": 108,
        "glu": 6.6,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-20"
  },
  {
    "id": "P-021",
    "name": "Juana Brandt",
    "age": 66,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "intermedaite-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "intermedaite",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "parascapusular",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 142,
        "dia": 84,
        "hr": 80,
        "glu": 5.4,
        "spo2": 92
      },
      {
        "t": "Tue",
        "sys": 146,
        "dia": 82,
        "hr": 85,
        "glu": 5.4,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 145,
        "dia": 82,
        "hr": 75,
        "glu": 5.5,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 141,
        "dia": 82,
        "hr": 80,
        "glu": 5.5,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 147,
        "dia": 86,
        "hr": 84,
        "glu": 5.8,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-21"
  },
  {
    "id": "P-022",
    "name": "Sara Frye",
    "age": 63,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "parascapusular",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 151,
        "dia": 104,
        "hr": 101,
        "glu": 5.9,
        "spo2": 87
      },
      {
        "t": "Tue",
        "sys": 150,
        "dia": 103,
        "hr": 104,
        "glu": 5.7,
        "spo2": 87
      },
      {
        "t": "Wed",
        "sys": 148,
        "dia": 104,
        "hr": 96,
        "glu": 5.8,
        "spo2": 87
      },
      {
        "t": "Thu",
        "sys": 150,
        "dia": 104,
        "hr": 96,
        "glu": 5.7,
        "spo2": 85
      },
      {
        "t": "Fri",
        "sys": 153,
        "dia": 104,
        "hr": 97,
        "glu": 5.8,
        "spo2": 86
      }
    ],
    "lastVisit": "2025-11-22"
  },
  {
    "id": "P-023",
    "name": "Victoria Luna",
    "age": 54,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left thigh",
      "status": "D",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 130,
        "dia": 89,
        "hr": 83,
        "glu": 6.1,
        "spo2": 94
      },
      {
        "t": "Tue",
        "sys": 137,
        "dia": 90,
        "hr": 87,
        "glu": 6.1,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 137,
        "dia": 93,
        "hr": 93,
        "glu": 6.4,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 140,
        "dia": 91,
        "hr": 90,
        "glu": 6.6,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 138,
        "dia": 92,
        "hr": 93,
        "glu": 6.8,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-23"
  },
  {
    "id": "P-024",
    "name": "Jenna Peterson",
    "age": 22,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right buttock",
      "status": "D",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 122,
        "dia": 70,
        "hr": 91,
        "glu": 5.3,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 126,
        "dia": 74,
        "hr": 84,
        "glu": 5.7,
        "spo2": 90
      },
      {
        "t": "Wed",
        "sys": 123,
        "dia": 71,
        "hr": 88,
        "glu": 5.9,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 127,
        "dia": 74,
        "hr": 88,
        "glu": 6.2,
        "spo2": 88
      },
      {
        "t": "Fri",
        "sys": 132,
        "dia": 77,
        "hr": 85,
        "glu": 6.5,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-11-24"
  },
  {
    "id": "P-025",
    "name": "Rita Smith",
    "age": 54,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 138,
        "dia": 89,
        "hr": 78,
        "glu": 5.4,
        "spo2": 94
      },
      {
        "t": "Tue",
        "sys": 134,
        "dia": 90,
        "hr": 87,
        "glu": 5.4,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 138,
        "dia": 89,
        "hr": 87,
        "glu": 5.6,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 136,
        "dia": 88,
        "hr": 78,
        "glu": 5.3,
        "spo2": 93
      },
      {
        "t": "Fri",
        "sys": 140,
        "dia": 88,
        "hr": 87,
        "glu": 5.4,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-25"
  },
  {
    "id": "P-026",
    "name": "Audrey Krueger",
    "age": 63,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "pleiomorphic spindle"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic spindle cell undifferentiated",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 155,
        "dia": 93,
        "hr": 100,
        "glu": 6.7,
        "spo2": 89
      },
      {
        "t": "Tue",
        "sys": 156,
        "dia": 96,
        "hr": 97,
        "glu": 6.9,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 154,
        "dia": 98,
        "hr": 95,
        "glu": 7.1,
        "spo2": 87
      },
      {
        "t": "Thu",
        "sys": 156,
        "dia": 96,
        "hr": 102,
        "glu": 7.2,
        "spo2": 89
      },
      {
        "t": "Fri",
        "sys": 153,
        "dia": 95,
        "hr": 94,
        "glu": 7.2,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-11-26"
  },
  {
    "id": "P-027",
    "name": "Virginia Johnson",
    "age": 58,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Synovial sarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "poorly differentiated synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "D",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 135,
        "dia": 89,
        "hr": 94,
        "glu": 5.7,
        "spo2": 87
      },
      {
        "t": "Tue",
        "sys": 140,
        "dia": 92,
        "hr": 91,
        "glu": 6.0,
        "spo2": 85
      },
      {
        "t": "Wed",
        "sys": 138,
        "dia": 91,
        "hr": 94,
        "glu": 6.0,
        "spo2": 86
      },
      {
        "t": "Thu",
        "sys": 140,
        "dia": 93,
        "hr": 100,
        "glu": 6.4,
        "spo2": 84
      },
      {
        "t": "Fri",
        "sys": 140,
        "dia": 91,
        "hr": 93,
        "glu": 6.6,
        "spo2": 86
      }
    ],
    "lastVisit": "2025-11-27"
  },
  {
    "id": "P-028",
    "name": "Connie Bailey",
    "age": 38,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left biceps",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 131,
        "dia": 84,
        "hr": 83,
        "glu": 6.4,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 132,
        "dia": 84,
        "hr": 86,
        "glu": 6.5,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 129,
        "dia": 84,
        "hr": 83,
        "glu": 6.4,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 128,
        "dia": 83,
        "hr": 91,
        "glu": 6.4,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 130,
        "dia": 80,
        "hr": 83,
        "glu": 6.3,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-11-28"
  },
  {
    "id": "P-029",
    "name": "Susan Taylor",
    "age": 83,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "left thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 155,
        "dia": 97,
        "hr": 93,
        "glu": 5.7,
        "spo2": 89
      },
      {
        "t": "Tue",
        "sys": 156,
        "dia": 99,
        "hr": 88,
        "glu": 5.8,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 151,
        "dia": 97,
        "hr": 87,
        "glu": 5.9,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 156,
        "dia": 98,
        "hr": 88,
        "glu": 5.8,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 152,
        "dia": 99,
        "hr": 84,
        "glu": 6.1,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-01"
  },
  {
    "id": "P-030",
    "name": "Charlene Stevens",
    "age": 61,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "poorly differentiated synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 146,
        "dia": 96,
        "hr": 88,
        "glu": 6.3,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 144,
        "dia": 96,
        "hr": 95,
        "glu": 6.3,
        "spo2": 90
      },
      {
        "t": "Wed",
        "sys": 143,
        "dia": 96,
        "hr": 96,
        "glu": 6.7,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 146,
        "dia": 95,
        "hr": 94,
        "glu": 6.7,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 148,
        "dia": 100,
        "hr": 91,
        "glu": 6.7,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-11-02"
  },
  {
    "id": "P-031",
    "name": "Jordan Hudson",
    "age": 43,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "myxoid fibrosarcoma"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "myxoid fibrosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 134,
        "dia": 82,
        "hr": 105,
        "glu": 6.5,
        "spo2": 87
      },
      {
        "t": "Tue",
        "sys": 134,
        "dia": 86,
        "hr": 99,
        "glu": 6.5,
        "spo2": 85
      },
      {
        "t": "Wed",
        "sys": 139,
        "dia": 83,
        "hr": 103,
        "glu": 6.7,
        "spo2": 87
      },
      {
        "t": "Thu",
        "sys": 142,
        "dia": 86,
        "hr": 96,
        "glu": 6.8,
        "spo2": 87
      },
      {
        "t": "Fri",
        "sys": 137,
        "dia": 84,
        "hr": 100,
        "glu": 7.1,
        "spo2": 87
      }
    ],
    "lastVisit": "2025-12-03"
  },
  {
    "id": "P-032",
    "name": "Jeffrey Boyd",
    "age": 49,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "sclerosing epithelio"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "sclerosing epithelioid fibrosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 137,
        "dia": 93,
        "hr": 87,
        "glu": 5.4,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 140,
        "dia": 91,
        "hr": 81,
        "glu": 5.4,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 141,
        "dia": 93,
        "hr": 83,
        "glu": 5.6,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 137,
        "dia": 92,
        "hr": 81,
        "glu": 5.5,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 138,
        "dia": 92,
        "hr": 89,
        "glu": 5.6,
        "spo2": 92
      }
    ],
    "lastVisit": "2025-12-04"
  },
  {
    "id": "P-033",
    "name": "David Salazar",
    "age": 44,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "pleiomorphic spindle",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic spindle cell undifferentiated",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 146,
        "dia": 89,
        "hr": 84,
        "glu": 6.5,
        "spo2": 90
      },
      {
        "t": "Tue",
        "sys": 151,
        "dia": 91,
        "hr": 88,
        "glu": 6.6,
        "spo2": 90
      },
      {
        "t": "Wed",
        "sys": 149,
        "dia": 87,
        "hr": 85,
        "glu": 6.5,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 152,
        "dia": 92,
        "hr": 87,
        "glu": 6.5,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 148,
        "dia": 89,
        "hr": 83,
        "glu": 6.6,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-12-05"
  },
  {
    "id": "P-034",
    "name": "Sarah Wilcox",
    "age": 62,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 144,
        "dia": 90,
        "hr": 81,
        "glu": 6.1,
        "spo2": 90
      },
      {
        "t": "Tue",
        "sys": 141,
        "dia": 89,
        "hr": 85,
        "glu": 6.3,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 140,
        "dia": 91,
        "hr": 81,
        "glu": 6.2,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 145,
        "dia": 89,
        "hr": 83,
        "glu": 6.3,
        "spo2": 88
      },
      {
        "t": "Fri",
        "sys": 146,
        "dia": 90,
        "hr": 82,
        "glu": 6.1,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-12-06"
  },
  {
    "id": "P-035",
    "name": "Linda Riley",
    "age": 64,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "malignant solitary f",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "malignant solitary fibrous tumor",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 140,
        "dia": 92,
        "hr": 91,
        "glu": 5.7,
        "spo2": 88
      },
      {
        "t": "Tue",
        "sys": 145,
        "dia": 92,
        "hr": 86,
        "glu": 5.5,
        "spo2": 87
      },
      {
        "t": "Wed",
        "sys": 143,
        "dia": 94,
        "hr": 81,
        "glu": 5.6,
        "spo2": 88
      },
      {
        "t": "Thu",
        "sys": 145,
        "dia": 92,
        "hr": 87,
        "glu": 5.9,
        "spo2": 87
      },
      {
        "t": "Fri",
        "sys": 141,
        "dia": 95,
        "hr": 81,
        "glu": 5.7,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-12-07"
  },
  {
    "id": "P-036",
    "name": "Mark Greene",
    "age": 74,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "undifferentiated ple"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "undifferentiated pleomorphic liposarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 156,
        "dia": 103,
        "hr": 95,
        "glu": 6.2,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 159,
        "dia": 104,
        "hr": 93,
        "glu": 6.1,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 160,
        "dia": 106,
        "hr": 96,
        "glu": 6.2,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 164,
        "dia": 103,
        "hr": 96,
        "glu": 6.6,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 160,
        "dia": 106,
        "hr": 91,
        "glu": 6.5,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-12-08"
  },
  {
    "id": "P-037",
    "name": "Joseph Moore",
    "age": 42,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "undifferentiated ple"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "undifferentiated pleomorphic liposarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left buttock",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 136,
        "dia": 90,
        "hr": 82,
        "glu": 6.3,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 137,
        "dia": 88,
        "hr": 87,
        "glu": 6.5,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 136,
        "dia": 91,
        "hr": 83,
        "glu": 6.4,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 136,
        "dia": 91,
        "hr": 86,
        "glu": 6.7,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 143,
        "dia": 89,
        "hr": 84,
        "glu": 6.5,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-12-09"
  },
  {
    "id": "P-038",
    "name": "Laurie Smith",
    "age": 80,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 151,
        "dia": 106,
        "hr": 90,
        "glu": 6.4,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 152,
        "dia": 105,
        "hr": 94,
        "glu": 6.6,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 152,
        "dia": 105,
        "hr": 85,
        "glu": 6.7,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 148,
        "dia": 108,
        "hr": 92,
        "glu": 6.5,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 150,
        "dia": 105,
        "hr": 90,
        "glu": 6.4,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-12-10"
  },
  {
    "id": "P-039",
    "name": "Dr. Diana Davis",
    "age": 30,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 126,
        "dia": 81,
        "hr": 99,
        "glu": 6.1,
        "spo2": 96
      },
      {
        "t": "Tue",
        "sys": 131,
        "dia": 85,
        "hr": 102,
        "glu": 6.2,
        "spo2": 94
      },
      {
        "t": "Wed",
        "sys": 131,
        "dia": 81,
        "hr": 99,
        "glu": 6.0,
        "spo2": 95
      },
      {
        "t": "Thu",
        "sys": 132,
        "dia": 83,
        "hr": 101,
        "glu": 6.1,
        "spo2": 94
      },
      {
        "t": "Fri",
        "sys": 129,
        "dia": 84,
        "hr": 93,
        "glu": 6.5,
        "spo2": 96
      }
    ],
    "lastVisit": "2025-12-11"
  },
  {
    "id": "P-040",
    "name": "Mrs. Linda Thomas MD",
    "age": 67,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Synovial sarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 154,
        "dia": 93,
        "hr": 87,
        "glu": 6.3,
        "spo2": 90
      },
      {
        "t": "Tue",
        "sys": 159,
        "dia": 93,
        "hr": 95,
        "glu": 6.5,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 159,
        "dia": 94,
        "hr": 90,
        "glu": 6.4,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 160,
        "dia": 94,
        "hr": 88,
        "glu": 6.5,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 157,
        "dia": 95,
        "hr": 93,
        "glu": 6.4,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-12-12"
  },
  {
    "id": "P-041",
    "name": "Juana Brandt",
    "age": 66,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "intermedaite-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "intermedaite",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "parascapusular",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 138,
        "dia": 93,
        "hr": 75,
        "glu": 5.3,
        "spo2": 98
      },
      {
        "t": "Tue",
        "sys": 139,
        "dia": 91,
        "hr": 76,
        "glu": 5.1,
        "spo2": 95
      },
      {
        "t": "Wed",
        "sys": 144,
        "dia": 90,
        "hr": 80,
        "glu": 5.3,
        "spo2": 97
      },
      {
        "t": "Thu",
        "sys": 143,
        "dia": 92,
        "hr": 78,
        "glu": 5.1,
        "spo2": 96
      },
      {
        "t": "Fri",
        "sys": 145,
        "dia": 93,
        "hr": 73,
        "glu": 5.2,
        "spo2": 97
      }
    ],
    "lastVisit": "2025-12-13"
  },
  {
    "id": "P-042",
    "name": "Sara Frye",
    "age": 63,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "parascapusular",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 155,
        "dia": 95,
        "hr": 91,
        "glu": 5.6,
        "spo2": 90
      },
      {
        "t": "Tue",
        "sys": 154,
        "dia": 94,
        "hr": 91,
        "glu": 5.9,
        "spo2": 90
      },
      {
        "t": "Wed",
        "sys": 150,
        "dia": 95,
        "hr": 89,
        "glu": 5.9,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 151,
        "dia": 94,
        "hr": 93,
        "glu": 5.9,
        "spo2": 89
      },
      {
        "t": "Fri",
        "sys": 157,
        "dia": 94,
        "hr": 95,
        "glu": 5.8,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-12-14"
  },
  {
    "id": "P-043",
    "name": "Victoria Luna",
    "age": 54,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left thigh",
      "status": "D",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 146,
        "dia": 90,
        "hr": 85,
        "glu": 6.2,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 144,
        "dia": 90,
        "hr": 89,
        "glu": 6.1,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 144,
        "dia": 88,
        "hr": 93,
        "glu": 6.3,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 149,
        "dia": 89,
        "hr": 92,
        "glu": 6.8,
        "spo2": 88
      },
      {
        "t": "Fri",
        "sys": 151,
        "dia": 93,
        "hr": 91,
        "glu": 7.1,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-12-15"
  },
  {
    "id": "P-044",
    "name": "Jenna Peterson",
    "age": 22,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right buttock",
      "status": "D",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 122,
        "dia": 71,
        "hr": 81,
        "glu": 5.4,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 121,
        "dia": 76,
        "hr": 86,
        "glu": 5.9,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 124,
        "dia": 77,
        "hr": 84,
        "glu": 6.1,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 123,
        "dia": 76,
        "hr": 90,
        "glu": 6.4,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 130,
        "dia": 79,
        "hr": 93,
        "glu": 6.5,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-12-16"
  },
  {
    "id": "P-045",
    "name": "Rita Smith",
    "age": 54,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 138,
        "dia": 82,
        "hr": 83,
        "glu": 5.5,
        "spo2": 88
      },
      {
        "t": "Tue",
        "sys": 138,
        "dia": 86,
        "hr": 82,
        "glu": 5.7,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 139,
        "dia": 83,
        "hr": 82,
        "glu": 5.7,
        "spo2": 88
      },
      {
        "t": "Thu",
        "sys": 143,
        "dia": 83,
        "hr": 88,
        "glu": 5.6,
        "spo2": 89
      },
      {
        "t": "Fri",
        "sys": 140,
        "dia": 87,
        "hr": 81,
        "glu": 5.8,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-12-17"
  },
  {
    "id": "P-046",
    "name": "Audrey Krueger",
    "age": 63,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "pleiomorphic spindle"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic spindle cell undifferentiated",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 156,
        "dia": 93,
        "hr": 93,
        "glu": 6.1,
        "spo2": 95
      },
      {
        "t": "Tue",
        "sys": 154,
        "dia": 94,
        "hr": 96,
        "glu": 6.0,
        "spo2": 93
      },
      {
        "t": "Wed",
        "sys": 157,
        "dia": 96,
        "hr": 98,
        "glu": 6.1,
        "spo2": 93
      },
      {
        "t": "Thu",
        "sys": 153,
        "dia": 92,
        "hr": 94,
        "glu": 6.3,
        "spo2": 94
      },
      {
        "t": "Fri",
        "sys": 160,
        "dia": 93,
        "hr": 99,
        "glu": 6.4,
        "spo2": 92
      }
    ],
    "lastVisit": "2025-12-18"
  },
  {
    "id": "P-047",
    "name": "Virginia Johnson",
    "age": 58,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Synovial sarcoma",
      "Deceased"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "poorly differentiated synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "D",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 150,
        "dia": 91,
        "hr": 84,
        "glu": 6.7,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 157,
        "dia": 94,
        "hr": 94,
        "glu": 6.7,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 153,
        "dia": 94,
        "hr": 95,
        "glu": 7.0,
        "spo2": 90
      },
      {
        "t": "Thu",
        "sys": 156,
        "dia": 92,
        "hr": 96,
        "glu": 7.2,
        "spo2": 89
      },
      {
        "t": "Fri",
        "sys": 160,
        "dia": 96,
        "hr": 87,
        "glu": 7.5,
        "spo2": 87
      }
    ],
    "lastVisit": "2025-12-19"
  },
  {
    "id": "P-048",
    "name": "Connie Bailey",
    "age": 38,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left biceps",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 139,
        "dia": 85,
        "hr": 93,
        "glu": 5.5,
        "spo2": 90
      },
      {
        "t": "Tue",
        "sys": 141,
        "dia": 84,
        "hr": 91,
        "glu": 5.6,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 136,
        "dia": 83,
        "hr": 85,
        "glu": 5.8,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 141,
        "dia": 83,
        "hr": 85,
        "glu": 5.8,
        "spo2": 88
      },
      {
        "t": "Fri",
        "sys": 140,
        "dia": 83,
        "hr": 90,
        "glu": 5.5,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-12-20"
  },
  {
    "id": "P-049",
    "name": "Susan Taylor",
    "age": 83,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "left thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 152,
        "dia": 95,
        "hr": 101,
        "glu": 6.3,
        "spo2": 95
      },
      {
        "t": "Tue",
        "sys": 151,
        "dia": 94,
        "hr": 98,
        "glu": 6.2,
        "spo2": 94
      },
      {
        "t": "Wed",
        "sys": 154,
        "dia": 94,
        "hr": 96,
        "glu": 6.3,
        "spo2": 93
      },
      {
        "t": "Thu",
        "sys": 155,
        "dia": 95,
        "hr": 94,
        "glu": 6.4,
        "spo2": 95
      },
      {
        "t": "Fri",
        "sys": 156,
        "dia": 97,
        "hr": 94,
        "glu": 6.4,
        "spo2": 93
      }
    ],
    "lastVisit": "2025-12-21"
  },
  {
    "id": "P-050",
    "name": "Charlene Stevens",
    "age": 61,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "poorly differentiated synovial sarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 161,
        "dia": 91,
        "hr": 104,
        "glu": 6.2,
        "spo2": 94
      },
      {
        "t": "Tue",
        "sys": 157,
        "dia": 91,
        "hr": 102,
        "glu": 6.1,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 156,
        "dia": 93,
        "hr": 107,
        "glu": 6.3,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 158,
        "dia": 93,
        "hr": 103,
        "glu": 6.1,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 157,
        "dia": 93,
        "hr": 108,
        "glu": 6.1,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-12-22"
  },
  {
    "id": "P-051",
    "name": "Jordan Hudson",
    "age": 43,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "myxoid fibrosarcoma"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "myxoid fibrosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 141,
        "dia": 81,
        "hr": 95,
        "glu": 5.7,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 142,
        "dia": 84,
        "hr": 95,
        "glu": 5.8,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 147,
        "dia": 85,
        "hr": 88,
        "glu": 6.2,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 145,
        "dia": 85,
        "hr": 95,
        "glu": 6.0,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 147,
        "dia": 83,
        "hr": 92,
        "glu": 6.2,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-12-23"
  },
  {
    "id": "P-052",
    "name": "Jeffrey Boyd",
    "age": 49,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "sclerosing epithelio"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "sclerosing epithelioid fibrosarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 132,
        "dia": 89,
        "hr": 98,
        "glu": 5.7,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 132,
        "dia": 92,
        "hr": 100,
        "glu": 6.0,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 132,
        "dia": 94,
        "hr": 95,
        "glu": 5.8,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 130,
        "dia": 95,
        "hr": 100,
        "glu": 6.2,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 135,
        "dia": 92,
        "hr": 94,
        "glu": 6.3,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-12-24"
  },
  {
    "id": "P-053",
    "name": "David Salazar",
    "age": 44,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "pleiomorphic spindle",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic spindle cell undifferentiated",
      "mskcc_type": "MFH",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 139,
        "dia": 89,
        "hr": 100,
        "glu": 6.4,
        "spo2": 89
      },
      {
        "t": "Tue",
        "sys": 136,
        "dia": 86,
        "hr": 103,
        "glu": 6.3,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 140,
        "dia": 90,
        "hr": 98,
        "glu": 6.4,
        "spo2": 88
      },
      {
        "t": "Thu",
        "sys": 140,
        "dia": 89,
        "hr": 101,
        "glu": 6.4,
        "spo2": 88
      },
      {
        "t": "Fri",
        "sys": 143,
        "dia": 91,
        "hr": 99,
        "glu": 6.4,
        "spo2": 88
      }
    ],
    "lastVisit": "2025-12-25"
  },
  {
    "id": "P-054",
    "name": "Sarah Wilcox",
    "age": 62,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 144,
        "dia": 91,
        "hr": 88,
        "glu": 6.2,
        "spo2": 90
      },
      {
        "t": "Tue",
        "sys": 143,
        "dia": 90,
        "hr": 89,
        "glu": 6.1,
        "spo2": 89
      },
      {
        "t": "Wed",
        "sys": 146,
        "dia": 93,
        "hr": 95,
        "glu": 6.4,
        "spo2": 91
      },
      {
        "t": "Thu",
        "sys": 146,
        "dia": 91,
        "hr": 95,
        "glu": 6.5,
        "spo2": 90
      },
      {
        "t": "Fri",
        "sys": 143,
        "dia": 90,
        "hr": 93,
        "glu": 6.5,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-12-26"
  },
  {
    "id": "P-055",
    "name": "Linda Riley",
    "age": 64,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "malignant solitary f",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "malignant solitary fibrous tumor",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 138,
        "dia": 96,
        "hr": 98,
        "glu": 5.9,
        "spo2": 96
      },
      {
        "t": "Tue",
        "sys": 140,
        "dia": 99,
        "hr": 100,
        "glu": 5.6,
        "spo2": 94
      },
      {
        "t": "Wed",
        "sys": 139,
        "dia": 99,
        "hr": 99,
        "glu": 5.7,
        "spo2": 95
      },
      {
        "t": "Thu",
        "sys": 137,
        "dia": 97,
        "hr": 94,
        "glu": 6.0,
        "spo2": 93
      },
      {
        "t": "Fri",
        "sys": 139,
        "dia": 100,
        "hr": 96,
        "glu": 5.8,
        "spo2": 94
      }
    ],
    "lastVisit": "2025-12-27"
  },
  {
    "id": "P-056",
    "name": "Mark Greene",
    "age": 74,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "undifferentiated ple"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "undifferentiated pleomorphic liposarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "right parascapusular",
      "status": "AWD",
      "treatment": "Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 152,
        "dia": 100,
        "hr": 93,
        "glu": 6.0,
        "spo2": 91
      },
      {
        "t": "Tue",
        "sys": 154,
        "dia": 101,
        "hr": 94,
        "glu": 6.2,
        "spo2": 92
      },
      {
        "t": "Wed",
        "sys": 153,
        "dia": 103,
        "hr": 101,
        "glu": 6.5,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 159,
        "dia": 104,
        "hr": 92,
        "glu": 6.5,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 155,
        "dia": 103,
        "hr": 99,
        "glu": 6.5,
        "spo2": 92
      }
    ],
    "lastVisit": "2025-12-28"
  },
  {
    "id": "P-057",
    "name": "Joseph Moore",
    "age": 42,
    "gender": "M",
    "tags": [
      "Bone tumor",
      "High-grade",
      "undifferentiated ple"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "undifferentiated pleomorphic liposarcoma",
      "mskcc_type": "MFH",
      "tumor_site": "left buttock",
      "status": "AWD",
      "treatment": "Radiotherapy + Surgery + Chemotherapy"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 140,
        "dia": 89,
        "hr": 88,
        "glu": 6.7,
        "spo2": 89
      },
      {
        "t": "Tue",
        "sys": 137,
        "dia": 90,
        "hr": 91,
        "glu": 6.8,
        "spo2": 87
      },
      {
        "t": "Wed",
        "sys": 137,
        "dia": 88,
        "hr": 92,
        "glu": 7.0,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 141,
        "dia": 92,
        "hr": 93,
        "glu": 7.3,
        "spo2": 89
      },
      {
        "t": "Fri",
        "sys": 140,
        "dia": 88,
        "hr": 86,
        "glu": 7.4,
        "spo2": 87
      }
    ],
    "lastVisit": "2025-12-01"
  },
  {
    "id": "P-058",
    "name": "Laurie Smith",
    "age": 80,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Synovial sarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "synovial sarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 156,
        "dia": 104,
        "hr": 91,
        "glu": 5.9,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 157,
        "dia": 102,
        "hr": 84,
        "glu": 6.0,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 153,
        "dia": 100,
        "hr": 90,
        "glu": 6.1,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 154,
        "dia": 101,
        "hr": 90,
        "glu": 6.0,
        "spo2": 92
      },
      {
        "t": "Fri",
        "sys": 154,
        "dia": 103,
        "hr": 87,
        "glu": 6.3,
        "spo2": 90
      }
    ],
    "lastVisit": "2025-12-02"
  },
  {
    "id": "P-059",
    "name": "Dr. Diana Davis",
    "age": 30,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "Intermediate-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "Intermediate",
      "histological_type": "leiomyosarcoma",
      "mskcc_type": "Leiomyosarcoma",
      "tumor_site": "right buttock",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 126,
        "dia": 74,
        "hr": 91,
        "glu": 5.7,
        "spo2": 93
      },
      {
        "t": "Tue",
        "sys": 126,
        "dia": 76,
        "hr": 92,
        "glu": 5.6,
        "spo2": 91
      },
      {
        "t": "Wed",
        "sys": 125,
        "dia": 75,
        "hr": 92,
        "glu": 5.8,
        "spo2": 92
      },
      {
        "t": "Thu",
        "sys": 121,
        "dia": 73,
        "hr": 95,
        "glu": 5.6,
        "spo2": 91
      },
      {
        "t": "Fri",
        "sys": 126,
        "dia": 75,
        "hr": 87,
        "glu": 5.8,
        "spo2": 91
      }
    ],
    "lastVisit": "2025-12-03"
  },
  {
    "id": "P-060",
    "name": "Mrs. Linda Thomas MD",
    "age": 67,
    "gender": "F",
    "tags": [
      "Bone tumor",
      "High-grade",
      "Leiomyosarcoma",
      "NED"
    ],
    "diagnosis": {
      "disease": "Bone tumor",
      "grade": "High",
      "histological_type": "pleiomorphic leiomyosarcoma",
      "mskcc_type": "Synovial sarcoma",
      "tumor_site": "right thigh",
      "status": "NED",
      "treatment": "Radiotherapy + Surgery"
    },
    "vitals": [
      {
        "t": "Mon",
        "sys": 150,
        "dia": 91,
        "hr": 105,
        "glu": 6.5,
        "spo2": 88
      },
      {
        "t": "Tue",
        "sys": 156,
        "dia": 92,
        "hr": 103,
        "glu": 6.5,
        "spo2": 88
      },
      {
        "t": "Wed",
        "sys": 154,
        "dia": 91,
        "hr": 106,
        "glu": 6.7,
        "spo2": 89
      },
      {
        "t": "Thu",
        "sys": 155,
        "dia": 90,
        "hr": 98,
        "glu": 6.6,
        "spo2": 89
      },
      {
        "t": "Fri",
        "sys": 156,
        "dia": 92,
        "hr": 104,
        "glu": 6.5,
        "spo2": 89
      }
    ],
    "lastVisit": "2025-12-04"
  }
]

const riskColor = (level: string) => ({
  Low: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-rose-100 text-rose-700',
} as any)[level] || 'bg-slate-100 text-slate-700'

function computeRisk(patient: any) {
  const last = patient.vitals[patient.vitals.length - 1]

  // Use ML model prediction if available
  if (patient.mlPrediction) {
    const mlRisk = patient.mlPrediction
    return {
      score: Math.round(mlRisk.confidence),
      level: mlRisk.risk_level,
      confidence: Math.round(mlRisk.confidence),
      nextStep: mlRisk.predicted_status === 'NED'
        ? 'Continue current treatment plan; routine monitoring'
        : mlRisk.predicted_status === 'AWD'
        ? 'Intensify monitoring; consider treatment adjustment'
        : 'Urgent oncology consultation; comprehensive care plan',
      mlStatus: mlRisk.predicted_status,
      mlProbabilities: mlRisk.probabilities
    }
  }

  // Fallback to rule-based calculation
  let score = 0
  score += Math.max(0, last.sys - 130) * 0.6
  score += Math.max(0, last.glu - 6.5) * 6
  score += Math.max(0, 95 - last.spo2) * 3  // Low oxygen saturation increases risk
  score += (patient.age > 50 ? 8 : 0)

  // Add diagnosis-based risk
  if (patient.diagnosis) {
    if (patient.diagnosis.grade === 'High') score += 15
    else if (patient.diagnosis.grade === 'Intermediate') score += 8

    if (patient.diagnosis.status === 'D') score += 30
    else if (patient.diagnosis.status === 'AWD') score += 20
  }

  const level = score > 30 ? 'High' : score > 15 ? 'Medium' : 'Low'
  const confidence = Math.min(95, 60 + Math.round(score * 0.5))
  const nextStep = level === 'High'
    ? 'Schedule urgent follow-up in 48h; order comprehensive tests'
    : level === 'Medium'
    ? 'Book check-up in 1–2 weeks; monitor closely'
    : 'Maintain routine monitoring; no immediate action'
  return { score: Math.round(score), level, confidence, nextStep }
}

export default function App(){
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState(MOCK_PATIENTS as any[])
  const [selectedId, setSelectedId] = useState(patients[0].id)
  const [tasks, setTasks] = useState([{ id: 'T-101', text: 'Call P-001 to confirm fasting blood test', priority: 'High' }])
  const [chat, setChat] = useState([{ role: 'assistant', text: 'Hi! I can predict risk and suggest next actions. Select a patient to begin.' }])
  const [mlEnabled, setMlEnabled] = useState(false)
  const [mlLoading, setMlLoading] = useState(false)
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
  async function fetchMLPrediction(){
    setMlLoading(true)
    try {
      const response = await fetch('http://localhost:5002/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: patient.age,
          gender: patient.gender,
          grade: patient.diagnosis?.grade || 'Intermediate',
          tumor_size: 5,
          depth: 'Deep',
          tumor_site: patient.diagnosis?.tumor_site || 'Unknown',
          histological_type: patient.diagnosis?.histological_type || 'Unknown',
          mskcc_type: patient.diagnosis?.mskcc_type || 'Unknown',
          treatment: patient.diagnosis?.treatment || 'Surgery'
        })
      })

      const data = await response.json()
      if (data.success) {
        // Update patient with ML prediction
        const updatedPatients = patients.map(p =>
          p.id === patient.id ? { ...p, mlPrediction: data.prediction } : p
        )
        setPatients(updatedPatients)
        setMlEnabled(true)

        const mlMsg = `ML Prediction: ${data.prediction.predicted_status} (${data.prediction.confidence.toFixed(1)}% confidence). Risk Level: ${data.prediction.risk_level}. Probabilities - NED: ${(data.prediction.probabilities.NED * 100).toFixed(1)}%, AWD: ${(data.prediction.probabilities.AWD * 100).toFixed(1)}%, Deceased: ${(data.prediction.probabilities.D * 100).toFixed(1)}%`
        setChat(c => [...c, { role: 'assistant', text: mlMsg }])
      }
    } catch (error) {
      console.error('ML API error:', error)
      setChat(c => [...c, { role: 'assistant', text: 'ML prediction service is not available. Using rule-based prediction.' }])
    } finally {
      setMlLoading(false)
    }
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
      const diagnosisInfo = patient.diagnosis ? `Diagnosis: ${patient.diagnosis.disease}, Grade: ${patient.diagnosis.grade}, Histological Type: ${patient.diagnosis.histological_type}, Tumor Site: ${patient.diagnosis.tumor_site}, Status: ${patient.diagnosis.status}, Treatment: ${patient.diagnosis.treatment}.` : ''
      const context = `You are a helpful medical assistant bot. Current patient: ${patient.name} (${patient.id}), Age: ${patient.age}, Gender: ${patient.gender}, Conditions: ${patient.tags.join(', ')}. ${diagnosisInfo} Current risk level: ${risk.level} (${risk.confidence}% confidence). Latest vitals - BP: ${latestVitals.sys}/${latestVitals.dia}, HR: ${latestVitals.hr}, Glucose: ${latestVitals.glu} mmol/L, SpO2: ${latestVitals.spo2}%.`
      
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
                {risk.mlStatus && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-medium text-blue-700">ML Prediction: {risk.mlStatus}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      NED: {((risk.mlProbabilities?.NED || 0) * 100).toFixed(1)}% |
                      AWD: {((risk.mlProbabilities?.AWD || 0) * 100).toFixed(1)}% |
                      D: {((risk.mlProbabilities?.D || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Button onClick={handlePredict} className="rounded-2xl"><CalendarClock className="h-4 w-4 mr-2"/>Predict & Add Task</Button>
                  <Button onClick={fetchMLPrediction} variant="secondary" className="rounded-2xl" disabled={mlLoading}>
                    <Brain className="h-4 w-4 mr-2"/>
                    {mlLoading ? 'Loading...' : 'ML Predict'}
                  </Button>
                  <div className="text-xs text-slate-500 w-full">(ML uses trained Random Forest model)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {patient.diagnosis && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Diagnostic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 border">
                    <div className="text-xs text-slate-500 mb-1">Disease</div>
                    <div className="text-sm font-medium">{patient.diagnosis.disease}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border">
                    <div className="text-xs text-slate-500 mb-1">Tumor Grade</div>
                    <div className="text-sm font-medium">{patient.diagnosis.grade}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border">
                    <div className="text-xs text-slate-500 mb-1">Status</div>
                    <div className="text-sm font-medium">
                      {patient.diagnosis.status === 'NED' && <Badge className="bg-green-100 text-green-800">No Evidence of Disease</Badge>}
                      {patient.diagnosis.status === 'AWD' && <Badge className="bg-yellow-100 text-yellow-800">Alive with Disease</Badge>}
                      {patient.diagnosis.status === 'D' && <Badge className="bg-red-100 text-red-800">Deceased</Badge>}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border">
                    <div className="text-xs text-slate-500 mb-1">MSKCC Type</div>
                    <div className="text-sm font-medium">{patient.diagnosis.mskcc_type}</div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border">
                  <div className="text-xs text-slate-500 mb-1">Histological Type</div>
                  <div className="text-sm font-medium">{patient.diagnosis.histological_type}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border">
                  <div className="text-xs text-slate-500 mb-1">Tumor Site</div>
                  <div className="text-sm font-medium">{patient.diagnosis.tumor_site}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border">
                  <div className="text-xs text-slate-500 mb-1">Treatment</div>
                  <div className="text-sm font-medium">{patient.diagnosis.treatment}</div>
                </div>
              </CardContent>
            </Card>
          )}
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