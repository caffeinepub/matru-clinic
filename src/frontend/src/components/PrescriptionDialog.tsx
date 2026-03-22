import type { Patient } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAllMedicines,
  useUpdatePatientStatus,
  useUpdatePrescription,
} from "@/hooks/useQueries";
import { Check, Loader2, Pill, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";

interface Props {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function PrescriptionDialog({ patient, open, onOpenChange }: Props) {
  const { data: catalogMedicines = [] } = useGetAllMedicines();
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [fee, setFee] = useState("");
  const updatePrescription = useUpdatePrescription();
  const updateStatus = useUpdatePatientStatus();

  useEffect(() => {
    if (patient) {
      const prescribed = new Set(
        patient.prescription.medicines.filter(Boolean),
      );
      setSelectedMeds(prescribed);
      setNotes(patient.prescription.notes);
      setFee(
        patient.prescription.consultationFee > 0n
          ? String(patient.prescription.consultationFee)
          : "",
      );
    }
  }, [patient]);

  const toggleMed = (name: string) => {
    setSelectedMeds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleStartConsulting = async () => {
    if (!patient) return;
    try {
      await updateStatus.mutateAsync({ id: patient.id, status: "consulting" });
      toast.success("Status updated to Consulting");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveComplete = async () => {
    if (!patient) return;
    const filledMeds = Array.from(selectedMeds);
    if (filledMeds.length === 0) {
      toast.error("Select at least one medicine");
      return;
    }
    try {
      await Promise.all([
        updatePrescription.mutateAsync({
          id: patient.id,
          medicines: filledMeds,
          notes: notes.trim(),
          fee: fee ? BigInt(fee) : 0n,
        }),
        updateStatus.mutateAsync({ id: patient.id, status: "completed" }),
      ]);
      toast.success("Prescription saved & consultation completed");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save prescription");
    }
  };

  const isBusy = updatePrescription.isPending || updateStatus.isPending;

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="prescription.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DialogTitle className="text-base font-semibold">
                {patient.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {String(patient.age)} yrs · {patient.gender} · {patient.phone}
              </p>
            </div>
            <StatusBadge status={patient.status} />
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          {/* Medicine selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              <Pill className="h-3.5 w-3.5 inline mr-1.5 text-primary" />
              Select Medicines
            </Label>

            {/* Selected badges */}
            {selectedMeds.size > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {Array.from(selectedMeds).map((name) => (
                  <Badge
                    key={name}
                    className="text-xs pr-1 flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleMed(name)}
                  >
                    {name}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {catalogMedicines.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <Pill className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground">
                  No medicines in catalog. Please add medicines in the Medicines
                  tab first.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-40 rounded-lg border border-border">
                <div className="p-2 space-y-1">
                  {catalogMedicines.map((med) => {
                    const selected = selectedMeds.has(med.name);
                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => toggleMed(med.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary"
                        }`}
                        data-ocid="prescription.toggle"
                      >
                        <div>
                          <p className="text-xs font-medium">{med.name}</p>
                          {med.dosageHint && (
                            <p
                              className={`text-xs mt-0.5 ${
                                selected
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {med.dosageHint}
                            </p>
                          )}
                        </div>
                        {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Notes / Advice</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Doctor's notes, lifestyle advice..."
              className="text-sm resize-none"
              rows={3}
              data-ocid="prescription.textarea"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Consultation Fee (₹)</Label>
            <Input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="e.g. 500"
              className="text-sm"
              data-ocid="prescription.input"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          {patient.status === "waiting" && (
            <Button
              variant="outline"
              onClick={handleStartConsulting}
              disabled={isBusy}
              className="border-primary text-primary hover:bg-secondary"
              data-ocid="prescription.secondary_button"
            >
              {isBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Start Consulting
            </Button>
          )}
          <Button
            onClick={handleSaveComplete}
            disabled={isBusy}
            data-ocid="prescription.submit_button"
          >
            {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save & Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
