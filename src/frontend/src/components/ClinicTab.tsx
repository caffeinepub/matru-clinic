import type { Patient } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllPatients } from "@/hooks/useQueries";
import {
  Calendar,
  Phone,
  Search,
  Stethoscope,
  User,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AddPatientDialog } from "./AddPatientDialog";
import { PrescriptionDialog } from "./PrescriptionDialog";
import { StatusBadge } from "./StatusBadge";

export function ClinicTab() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { data: patients = [], isLoading } = useGetAllPatients();

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
            data-ocid="clinic.search_input"
          />
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="shrink-0"
          data-ocid="clinic.open_modal_button"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Patient list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="clinic.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="clinic.empty_state"
        >
          <Stethoscope className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            No patients found
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {search
              ? "Try a different search"
              : "Add your first patient to get started"}
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-2">
            {filtered.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: index * 0.04 }}
                data-ocid={`clinic.item.${index + 1}`}
              >
                <Card
                  className="cursor-pointer hover:shadow-card transition-shadow border-border"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {patient.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {String(patient.age)} yrs
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {patient.gender}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={patient.status} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                          data-ocid="clinic.edit_button"
                        >
                          Add Rx
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <AddPatientDialog open={addOpen} onOpenChange={setAddOpen} />
      <PrescriptionDialog
        patient={selectedPatient}
        open={!!selectedPatient}
        onOpenChange={(v) => {
          if (!v) setSelectedPatient(null);
        }}
      />
    </div>
  );
}
