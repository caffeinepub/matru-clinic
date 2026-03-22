# Matru Clinic

## Current State
- Patients stored in non-stable Map (data lost on canister upgrade/restart)
- Medicines Tab only shows aggregated view of prescribed medicines per patient
- Prescription dialog has free-text medicine input fields
- No medicine catalog/inventory management
- No doctor name displayed

## Requested Changes (Diff)

### Add
- Stable storage for both patients and medicines so data survives upgrades/refreshes
- Medicine catalog: a separate list of medicines managed from the Medicines tab
- Medicines Tab: Add/delete medicines to the clinic's catalog (name, dosage hint)
- PrescriptionDialog: Doctor selects medicines from the catalog (dropdown/multi-select) instead of free text
- Dr. Dhairya Bhatt name shown in the clinic/doctor section header

### Modify
- Backend: use stable var arrays + pre/postupgrade hooks for persistence
- Backend: add medicine catalog CRUD (addMedicine, getAllMedicines, deleteMedicine)
- Backend: prescription medicines still stored as [Text] (medicine names from catalog)
- MedicinesTab: Show catalog management UI at top, aggregated prescriptions below
- PrescriptionDialog: Replace free-text inputs with select from catalog

### Remove
- Free-text medicine input in prescription dialog

## Implementation Plan
1. Update main.mo: stable var for patients map + medicine catalog map, pre/postupgrade hooks
2. Add getMedicines, addMedicine, deleteMedicine functions
3. Update MedicinesTab to show medicine catalog with add/delete + prescribed summary
4. Update PrescriptionDialog to select medicines from catalog
5. Add hooks for medicine catalog queries/mutations
6. Display "Dr. Dhairya Bhatt" in the Clinic tab header
