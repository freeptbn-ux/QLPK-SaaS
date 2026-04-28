# Security Verification: Phase 02 RLS Redesign

## 🎯 Objectives
Verify that the new Row Level Security (RLS) policies correctly isolate data between clinics and enforce role-based access control.

## 🧪 Verification Scenarios

### 1. Data Isolation (Multi-tenancy)
**Goal**: Ensure User A (Clinic 1) cannot see patients from User B (Clinic 2).

**Steps**:
1. Create two users in Supabase Auth.
2. Manually assign them to different `clinic_id` in the `profiles` table.
3. Insert a patient record for each user.
4. Use `supabase.from('patients').select('*')` with each user's session.
5. **Expected Result**: Each user only sees the patient belonging to their own clinic.

### 2. Role-Based Access Control (RBAC)
**Goal**: Ensure Staff cannot delete patients, but Admins can.

**Steps**:
1. Assign User C the `staff` role in `profiles`.
2. Assign User D the `admin` role in `profiles`.
3. Try to delete a patient record using User C's session.
4. **Expected Result**: Request should fail or return 0 rows affected.
5. Try to delete the same patient record using User D's session.
6. **Expected Result**: Request should succeed.

### 3. Anonymous Access Prevention
**Goal**: Ensure unauthenticated users have zero access to data.

**Steps**:
1. Initialize Supabase client without a session.
2. Try to query `patients` or `settings`.
3. **Expected Result**: Should return empty results or permission error.

### 4. Tenant-Aware RPCs
**Goal**: Ensure `upsert_patient` and `create_prescription` respect tenant boundaries.

**Steps**:
1. Call `upsert_patient` with a patient name that exists in Clinic 2, while logged in as User A (Clinic 1).
2. **Expected Result**: It should create a NEW patient record for Clinic 1 instead of updating the one in Clinic 2 (isolated unique constraint).
3. Try to call `create_prescription` for a `patient_id` that belongs to another clinic.
4. **Expected Result**: Should throw "Patient not found or access denied".

## 🛠️ Verification Code Snippet (TypeScript)

```typescript
// Test Multi-tenancy
const { data: patients, error } = await supabase.from('patients').select('*');
console.log(`Found ${patients?.length} patients`);

// Test RBAC (Staff deleting)
const { error: deleteErr } = await supabase.from('patients').delete().eq('id', 123);
if (deleteErr) console.log('Staff delete blocked (Correct)');

// Test RPC cross-tenant access
const { error: rpcErr } = await supabase.rpc('create_prescription', {
  p_patient_id: 999, // ID from another clinic
  p_diagnosis: 'Hacker attempt',
  p_items: []
});
console.log(rpcErr.message); // Should be access denied
```

---
Verification Status: ⬜ Ready for Manual Testing
