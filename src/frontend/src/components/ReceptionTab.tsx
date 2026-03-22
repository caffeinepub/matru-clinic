import type { Patient } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllPatients, useMarkAsPaid } from "@/hooks/useQueries";
import { ClipboardList, CreditCard, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";

const FILTERS = ["all", "waiting", "consulting", "completed", "paid"] as const;
type Filter = (typeof FILTERS)[number];

export function ReceptionTab() {
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmPay, setConfirmPay] = useState<Patient | null>(null);
  const { data: patients = [], isLoading } = useGetAllPatients();
  const markPaid = useMarkAsPaid();

  const filtered =
    filter === "all" ? patients : patients.filter((p) => p.status === filter);

  const handleMarkPaid = async () => {
    if (!confirmPay) return;
    try {
      await markPaid.mutateAsync(confirmPay.id);
      toast.success(`Payment recorded for ${confirmPay.name}`);
      setConfirmPay(null);
    } catch {
      toast.error("Failed to mark as paid");
    }
  };

  const filterLabel = (f: Filter) =>
    f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1);

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        data-ocid="reception.tab"
      >
        {FILTERS.map((f) => (
          <button
            type="button"
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:border-primary hover:text-primary"
            }`}
            data-ocid="reception.tab"
          >
            {filterLabel(f)}
          </button>
        ))}
      </div>

      {/* Patient cards */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="reception.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="reception.empty_state"
        >
          <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            No patients in this category
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {filtered.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.04 }}
                data-ocid={`reception.item.${index + 1}`}
              >
                <Card className="border-border shadow-xs">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-semibold text-sm">
                            {patient.name}
                          </p>
                          <StatusBadge status={patient.status} />
                        </div>
                        {patient.prescription.medicines.length > 0 && (
                          <div className="mb-1">
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">
                              Medicines:
                            </p>
                            <p className="text-xs text-foreground">
                              {patient.prescription.medicines.join(", ")}
                            </p>
                          </div>
                        )}
                        {patient.prescription.consultationFee > 0n && (
                          <p className="text-sm font-semibold text-primary mt-1">
                            ₹{String(patient.prescription.consultationFee)}
                          </p>
                        )}
                      </div>
                      {patient.status === "completed" && (
                        <Button
                          size="sm"
                          onClick={() => setConfirmPay(patient)}
                          disabled={markPaid.isPending}
                          className="shrink-0 h-8 text-xs"
                          data-ocid="reception.primary_button"
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <AlertDialog
        open={!!confirmPay}
        onOpenChange={(v) => {
          if (!v) setConfirmPay(null);
        }}
      >
        <AlertDialogContent data-ocid="reception.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Mark payment received from <strong>{confirmPay?.name}</strong>?
              {confirmPay?.prescription.consultationFee
                ? ` Amount: ₹${String(confirmPay.prescription.consultationFee)}`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="reception.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkPaid}
              disabled={markPaid.isPending}
              data-ocid="reception.confirm_button"
            >
              {markPaid.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
