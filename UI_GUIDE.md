# Department Routing UI Guide

## 🎨 Visual Guide to the Department Routing Interface

### Task Queue Section

The Task Queue now includes department routing with visual indicators:

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Task Queue                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Add a task e.g. Order HbA1c                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────────────────────────┐   │
│  │ Priority ▼   │  │  ➕ Add Task                     │   │
│  └──────────────┘  └──────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [All (3)] [Triage (1)] [Endocrinology (2)]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Order HbA1c test                                    │   │
│  │ T-1234567890                                        │   │
│  │ [Endocrinology 85%]                    [High] [🗑]  │   │
│  │ ✅ Auto-routed                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Patient feels unwell                                │   │
│  │ T-1234567891                                        │   │
│  │ [General 60%] ⚠ Needs Review         [Normal] [🗑]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Department Chips Explained

### High-Confidence (Auto-Routed)
```
┌──────────────────────┐
│ Endocrinology 85%    │  ← Green background
└──────────────────────┘
```
- **Color**: Green (bg-green-50, text-green-700)
- **Meaning**: Confidence ≥ 80%, automatically routed
- **Action**: No review needed, sent directly to department

### Low-Confidence (Needs Triage)
```
┌──────────────────────┐
│ General 60%          │  ← Amber background
│ ⚠ Needs Review       │
└──────────────────────┘
```
- **Color**: Amber (bg-amber-50, text-amber-700)
- **Meaning**: Confidence < 80%, uncertain routing
- **Action**: Requires human review and manual assignment

---

## 📑 Department Filter Tabs

### Tab Layout
```
┌────────┬──────────┬──────────────────┬────────────┬─────────────┐
│ All (5)│Triage (2)│Endocrinology (2) │Cardiology(1)│Dermatology(0)│
└────────┴──────────┴──────────────────┴────────────┴─────────────┘
  Active   Inactive      Inactive         Inactive      Inactive
```

### Tab Descriptions

#### All Tasks
- Shows **all tasks** regardless of department
- Count shows total number of tasks
- Default view when page loads

#### Needs Triage
- Shows **only tasks with auto_routed = false**
- These are tasks with confidence < 80%
- Requires staff review and manual routing
- Critical for quality control

#### Department-Specific Tabs
- **Dynamically generated** based on tasks
- Shows only tasks routed to that department
- Count shows tasks in that department
- Examples: Endocrinology, Cardiology, Dermatology, etc.

---

## 🎨 Color Coding System

### Department Chip Colors

| Confidence | Color | Background | Text | Border |
|------------|-------|------------|------|--------|
| ≥ 80% | 🟢 Green | bg-green-50 | text-green-700 | border-green-200 |
| < 80% | 🟡 Amber | bg-amber-50 | text-amber-700 | border-amber-200 |

### Tab Button States

| State | Variant | Appearance |
|-------|---------|------------|
| Active | default | Blue background, white text |
| Inactive | secondary | Gray background, dark text |

---

## 📱 Responsive Design

### Desktop View (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  Patients  │  Vitals & Charts  │  Task Queue & Helper Bot  │
│   (3 cols) │     (6 cols)      │        (3 cols)           │
└─────────────────────────────────────────────────────────────┘
```

### Mobile View (<1024px)
```
┌─────────────────┐
│   Patients      │
├─────────────────┤
│ Vitals & Charts │
├─────────────────┤
│   Task Queue    │
├─────────────────┤
│   Helper Bot    │
└─────────────────┘
```

---

## 🔄 User Workflow

### Adding a Task

1. **Type task text**
   ```
   ┌─────────────────────────────────────┐
   │ Order glucose monitoring            │
   └─────────────────────────────────────┘
   ```

2. **Select priority**
   ```
   ┌──────────────┐
   │ High      ▼  │
   └──────────────┘
   ```

3. **Click Add Task**
   ```
   ┌──────────────────┐
   │ ➕ Add Task      │
   └──────────────────┘
   ```

4. **System routes automatically**
   - Calls `/api/route` endpoint
   - Analyzes text for keywords
   - Determines department and confidence
   - Returns routing result

5. **Task appears with chip**
   ```
   ┌─────────────────────────────────────┐
   │ Order glucose monitoring            │
   │ T-1234567892                        │
   │ [Endocrinology 85%]      [High] [🗑]│
   └─────────────────────────────────────┘
   ```

### Filtering Tasks

1. **Click department tab**
   ```
   [All (5)] [Triage (2)] [Endocrinology (2)]
                              ↑ Click here
   ```

2. **View filtered tasks**
   - Only shows tasks for that department
   - Other tasks hidden
   - Count updates in real-time

3. **Switch back to All**
   ```
   [All (5)] [Triage (2)] [Endocrinology (2)]
      ↑ Click here
   ```

---

## 🎯 Visual Indicators

### Task Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green chip | High confidence, auto-routed |
| 🟡 Amber chip | Low confidence, needs review |
| ⚠ Warning icon | Requires human attention |
| Percentage | Routing confidence level |

### Priority Badges

```
┌──────┐  ┌────────┐  ┌──────┐
│ High │  │ Normal │  │ Low  │
└──────┘  └────────┘  └──────┘
```

---

## 📊 Example Task Cards

### Example 1: High-Confidence Endocrinology Task
```
┌─────────────────────────────────────────────────────────┐
│ Order HbA1c test for diabetes patient                   │
│ T-1701234567                                            │
│                                                         │
│ [Endocrinology 85%]                        [High] [🗑]  │
│  ↑ Green chip                                           │
└─────────────────────────────────────────────────────────┘
```

### Example 2: High-Confidence Cardiology Task
```
┌─────────────────────────────────────────────────────────┐
│ Patient has chest pain and high blood pressure         │
│ T-1701234568                                            │
│                                                         │
│ [Cardiology 85%]                         [High] [🗑]    │
│  ↑ Green chip                                           │
└─────────────────────────────────────────────────────────┘
```

### Example 3: Low-Confidence Triage Task
```
┌─────────────────────────────────────────────────────────┐
│ Patient feels unwell                                    │
│ T-1701234569                                            │
│                                                         │
│ [General 60%] ⚠ Needs Review              [Normal] [🗑] │
│  ↑ Amber chip  ↑ Warning                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 CSS Classes Used

### Department Chips
```css
/* High confidence (auto-routed) */
.bg-green-50 .text-green-700 .border-green-200

/* Low confidence (needs triage) */
.bg-amber-50 .text-amber-700 .border-amber-200
```

### Tab Buttons
```css
/* Active tab */
variant="default"  /* Blue background */

/* Inactive tab */
variant="secondary"  /* Gray background */
```

### Task Cards
```css
.rounded-2xl .border .bg-white .p-3
```

---

## 🔍 Interactive Elements

### Clickable Elements

1. **Department Tabs** - Filter tasks by department
2. **Add Task Button** - Create new task with routing
3. **Delete Button (🗑)** - Remove task from queue
4. **Priority Dropdown** - Select task priority

### Hover States

- **Tabs**: Slight color change on hover
- **Buttons**: Shadow and color change
- **Task cards**: Subtle border highlight

---

## 📱 Mobile Optimizations

### Responsive Tab Layout
```
Desktop:
[All (5)] [Triage (2)] [Endocrinology (2)] [Cardiology (1)]

Mobile (wraps):
[All (5)] [Triage (2)]
[Endocrinology (2)] [Cardiology (1)]
```

### Touch-Friendly Buttons
- Minimum 44px touch target
- Adequate spacing between elements
- Large tap areas for mobile users

---

## 🎉 Summary

The Department Routing UI provides:
- ✅ **Clear visual feedback** with color-coded chips
- ✅ **Easy filtering** with department tabs
- ✅ **Confidence transparency** with percentage display
- ✅ **Triage visibility** with warning indicators
- ✅ **Responsive design** for all screen sizes
- ✅ **Intuitive workflow** from task creation to routing

**Result:** A user-friendly interface that makes department routing transparent and manageable! 🎨

