# Quick Reference: Patient Care Workflow

## 🎯 What Changed?

### 1. Bed Assignment Now Requires Treatment Plan ✅
**Before:** Could assign bed without treatment plan
**After:** Must create treatment plan first (for inpatients)

### 2. Automatic Nurse Tasks ✅
**Before:** Manual task creation
**After:** Tasks automatically created from treatment plans

### 3. Combined Diagnosis + Notes ✅
**Before:** Two separate API calls
**After:** Single call for both

---

## 🚀 Quick Start Examples

### Example 1: Admit Inpatient (Full Workflow)

```javascript
// 1. Admit patient (creates visit)
POST /api/logistics/admit
{
  "patientId": 1,
  "type": "Inpatient"
}
// Returns: { visitId: 1 }

// 2. Add diagnosis with notes
POST /api/clinical/diagnosis-with-notes
{
  "visitId": 1,
  "diagnosisNotes": "Acute appendicitis",
  "doctorNotes": "Patient requires immediate surgery"
}

// 3. Create treatment plan with nurse tasks
POST /api/clinical/treatment-plans-with-tasks
{
  "visitId": 1,
  "details": "Pre-op preparation, NPO status, IV fluids",
  "assignedNurseId": 3,
  "customTasks": [
    "Prepare patient for surgery",
    "Start IV line",
    "Monitor vital signs every 30 minutes"
  ]
}
// Creates: Treatment plan + 6 nurse tasks

// 4. Assign bed (now works because treatment plan exists)
POST /api/logistics/admit
{
  "patientId": 1,
  "type": "Inpatient",
  "bedId": 5,
  "assignedNurseId": 3
}
// Creates: Bed assignment + 4 more nurse tasks
```

---

### Example 2: Quick Admission (All-in-One)

```javascript
// Single call to create treatment plan and assign bed
POST /api/logistics/beds/assign-with-plan
{
  "patientId": 1,
  "bedId": 5,
  "visitId": 1,
  "treatmentPlanDetails": "Observation for 24 hours, monitor vitals",
  "assignedNurseId": 3
}
// Creates: Treatment plan + Bed assignment + 9 nurse tasks
```

---

## 📋 API Cheat Sheet

### Combined Operations (NEW):
| Endpoint | What It Does |
|----------|-------------|
| `POST /api/clinical/diagnosis-with-notes` | Add diagnosis + doctor notes together |
| `POST /api/clinical/treatment-plans-with-tasks` | Create treatment plan + auto-generate nurse tasks |
| `POST /api/logistics/beds/assign-with-plan` | Create treatment plan + assign bed + create tasks |

### Request Bodies:

#### Diagnosis with Notes:
```json
{
  "visitId": 1,
  "diagnosisNotes": "Medical diagnosis here",
  "doctorNotes": "Additional notes here (optional)"
}
```

#### Treatment Plan with Tasks:
```json
{
  "visitId": 1,
  "details": "Treatment plan details",
  "assignedNurseId": 3,
  "customTasks": ["Task 1", "Task 2"] // optional
}
```

#### Bed Assignment with Plan:
```json
{
  "patientId": 1,
  "bedId": 5,
  "visitId": 1,
  "treatmentPlanDetails": "Plan details",
  "assignedNurseId": 3
}
```

---

## ⚠️ Important Rules

### Rule 1: Treatment Plan Required for Inpatient Beds
```
✅ Outpatient → No treatment plan needed
❌ Inpatient without treatment plan → ERROR
✅ Inpatient with treatment plan → SUCCESS
```

### Rule 2: Nurse Assignment Creates Tasks
```
✅ assignedNurseId provided → Tasks created automatically
⚠️ No assignedNurseId → No tasks created (manual assignment needed later)
```

### Rule 3: Custom Tasks Are Optional
```
✅ With customTasks → Default tasks + Custom tasks
✅ Without customTasks → Only default tasks
```

---

## 🔍 Default Tasks Generated

### When Assigning Bed:
1. Check vital signs every 4 hours
2. Administer prescribed medications
3. Monitor patient comfort and needs
4. Update patient care records

### When Creating Treatment Plan:
1. Monitor patient response to treatment
2. Document treatment progress
3. Report any adverse reactions immediately

---

## 🐛 Common Errors & Solutions

### Error: "Treatment plan is required"
**Cause:** Trying to assign bed without treatment plan
**Solution:** Create treatment plan first OR use `assign-with-plan` endpoint

### Error: "Staff profile not found"
**Cause:** User not linked to staff record
**Solution:** Ensure logged-in user has staff profile

### Error: "Bed not available"
**Cause:** Bed already assigned
**Solution:** Choose different bed or discharge current patient

---

## 💡 Best Practices

### 1. For Emergency Admissions:
Use `assign-with-plan` endpoint for speed:
```javascript
POST /api/logistics/beds/assign-with-plan
```

### 2. For Routine Admissions:
Follow step-by-step workflow:
1. Admit patient
2. Add diagnosis with notes
3. Create treatment plan with tasks
4. Assign bed

### 3. For Outpatients:
No treatment plan needed:
```javascript
POST /api/logistics/admit
{
  "patientId": 1,
  "type": "Outpatient"
}
```

### 4. For Custom Care:
Always add specific tasks:
```javascript
{
  "customTasks": [
    "Specific instruction 1",
    "Specific instruction 2"
  ]
}
```

---

## 📊 Workflow Diagram

```
Patient Arrives
      ↓
Admit Patient (Create Visit)
      ↓
Doctor Examines
      ↓
Add Diagnosis + Notes (Combined)
      ↓
Create Treatment Plan
      ↓
[Automatic: Generate Nurse Tasks]
      ↓
Assign Bed (if Inpatient)
      ↓
[Automatic: Generate More Tasks]
      ↓
Nurse Receives All Tasks
      ↓
Patient Care Begins
```

---

## 🎓 Learning Path

### Beginner:
1. Start with simple outpatient admission
2. Practice adding diagnosis with notes
3. Try creating treatment plans

### Intermediate:
4. Add custom nurse tasks
5. Practice full inpatient workflow
6. Use combined endpoints

### Advanced:
7. Use `assign-with-plan` for efficiency
8. Integrate with frontend
9. Handle error cases gracefully

---

## 🔗 Related Documentation

- **Full Details:** `WORKFLOW_ENHANCEMENTS.md`
- **API Examples:** `API_EXAMPLES.js`
- **Feature Updates:** `FEATURE_UPDATES.md`

---

**Quick Tip:** Always assign a nurse when creating treatment plans to get automatic task generation! 🚀
