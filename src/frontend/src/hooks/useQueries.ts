import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetAllPatients() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useAddPatient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: string;
      name: string;
      phone: string;
      age: bigint;
      gender: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addPatient(p.id, p.name, p.phone, p.age, p.gender);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useUpdatePrescription() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: string;
      medicines: string[];
      notes: string;
      fee: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePrescription(p.id, p.medicines, p.notes, p.fee);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useUpdatePatientStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePatientStatus(p.id, p.status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useMarkAsPaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.markAsPaid(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}

export function useDeletePatient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePatient(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
}

interface MedicineCatalogItem {
  id: string;
  name: string;
  dosageHint: string;
}

type ActorWithMedicines = {
  getAllMedicines(): Promise<MedicineCatalogItem[]>;
  addMedicine(id: string, name: string, dosageHint: string): Promise<void>;
  deleteMedicine(id: string): Promise<void>;
};

export function useGetAllMedicines() {
  const { actor, isFetching } = useActor();
  return useQuery<MedicineCatalogItem[]>({
    queryKey: ["medicines"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ActorWithMedicines).getAllMedicines();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useAddMedicine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; name: string; dosageHint: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as ActorWithMedicines).addMedicine(
        p.id,
        p.name,
        p.dosageHint,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicines"] }),
  });
}

export function useDeleteMedicine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as ActorWithMedicines).deleteMedicine(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicines"] }),
  });
}
