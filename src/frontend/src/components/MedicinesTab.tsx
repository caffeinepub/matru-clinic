import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddMedicine,
  useDeleteMedicine,
  useGetAllMedicines,
  useGetAllPatients,
} from "@/hooks/useQueries";
import { Loader2, Pill, Plus, Trash2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";

interface MedicineEntry {
  medicine: string;
  patients: Array<{ name: string; status: string }>;
}

export function MedicinesTab() {
  const { data: medicines = [], isLoading: medLoading } = useGetAllMedicines();
  const { data: patients = [], isLoading: patLoading } = useGetAllPatients();
  const addMedicine = useAddMedicine();
  const deleteMedicine = useDeleteMedicine();

  const [showForm, setShowForm] = useState(false);
  const [medName, setMedName] = useState("");
  const [dosageHint, setDosageHint] = useState("");

  const grouped = useMemo<MedicineEntry[]>(() => {
    const map = new Map<string, Array<{ name: string; status: string }>>();
    for (const patient of patients) {
      for (const med of patient.prescription.medicines) {
        const key = med.trim();
        if (!key) continue;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ name: patient.name, status: patient.status });
      }
    }
    return Array.from(map.entries())
      .map(([medicine, pts]) => ({ medicine, patients: pts }))
      .sort((a, b) => b.patients.length - a.patients.length);
  }, [patients]);

  const handleAddMedicine = async () => {
    if (!medName.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    try {
      await addMedicine.mutateAsync({
        id: Date.now().toString(),
        name: medName.trim(),
        dosageHint: dosageHint.trim(),
      });
      toast.success(`${medName.trim()} added to catalog`);
      setMedName("");
      setDosageHint("");
      setShowForm(false);
    } catch {
      toast.error("Failed to add medicine");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMedicine.mutateAsync(id);
      toast.success(`${name} removed from catalog`);
    } catch {
      toast.error("Failed to delete medicine");
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Section A: Medicine Catalog ── */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Medicine Catalog
            </CardTitle>
            <Button
              size="sm"
              variant={showForm ? "secondary" : "default"}
              className="h-7 text-xs"
              onClick={() => setShowForm((v) => !v)}
              data-ocid="medicines.open_modal_button"
            >
              <Plus className="h-3 w-3 mr-1" />
              {showForm ? "Cancel" : "Add Medicine"}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 pb-4">
                <div className="bg-secondary/40 rounded-lg p-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Medicine Name *</Label>
                    <Input
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className="text-sm h-8"
                      data-ocid="medicines.input"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddMedicine()
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Dosage Hint (optional)</Label>
                    <Input
                      value={dosageHint}
                      onChange={(e) => setDosageHint(e.target.value)}
                      placeholder="e.g. 500mg twice daily"
                      className="text-sm h-8"
                      data-ocid="medicines.input"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddMedicine()
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddMedicine}
                    disabled={addMedicine.isPending}
                    className="w-full h-8 text-xs"
                    data-ocid="medicines.submit_button"
                  >
                    {addMedicine.isPending ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : null}
                    Add to Catalog
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className={showForm ? "pt-0" : "pt-0 pb-4"}>
          {medLoading ? (
            <div className="space-y-2" data-ocid="medicines.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-6" data-ocid="medicines.empty_state">
              <Pill className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                No medicines in catalog yet. Add one above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {medicines.map((med, index) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border"
                  data-ocid={`medicines.item.${index + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">
                      {med.name}
                    </p>
                    {med.dosageHint && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {med.dosageHint}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleDelete(med.id, med.name)}
                    disabled={deleteMedicine.isPending}
                    data-ocid={`medicines.delete_button.${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ── Section B: Prescribed Summary ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Prescribed Summary</h3>
          <Badge variant="secondary" className="text-xs ml-auto">
            {grouped.length} medicine{grouped.length !== 1 ? "s" : ""}{" "}
            prescribed
          </Badge>
        </div>

        {patLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Pill className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">
              No medicines prescribed to patients yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((entry, index) => (
              <motion.div
                key={entry.medicine}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="border-border shadow-xs">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Pill className="h-3.5 w-3.5 text-primary" />
                        {entry.medicine}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {entry.patients.length} patient
                        {entry.patients.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-1.5">
                      {entry.patients.map((pt) => (
                        <div
                          key={`${entry.medicine}-${pt.name}`}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-foreground">
                            {pt.name}
                          </span>
                          <StatusBadge status={pt.status} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
