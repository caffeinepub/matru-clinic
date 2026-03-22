import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Prescription {
    notes: string;
    consultationFee: bigint;
    medicines: Array<string>;
}
export interface Patient {
    id: string;
    age: bigint;
    status: string;
    prescription: Prescription;
    name: string;
    createdAt: bigint;
    gender: string;
    phone: string;
}
export interface Medicine {
    id: string;
    name: string;
    dosageHint: string;
}
export interface backendInterface {
    addPatient(id: string, name: string, phone: string, age: bigint, gender: string): Promise<void>;
    deletePatient(id: string): Promise<void>;
    getAllPatients(): Promise<Array<Patient>>;
    getPatient(id: string): Promise<Patient>;
    markAsPaid(id: string): Promise<void>;
    updatePatientStatus(id: string, status: string): Promise<void>;
    updatePrescription(id: string, medicines: Array<string>, notes: string, fee: bigint): Promise<void>;
    addMedicine(id: string, name: string, dosageHint: string): Promise<void>;
    getAllMedicines(): Promise<Array<Medicine>>;
    deleteMedicine(id: string): Promise<void>;
}
