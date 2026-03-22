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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddPatient } from "@/hooks/useQueries";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AddPatientDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const addPatient = useAddPatient();

  const reset = () => {
    setName("");
    setPhone("");
    setAge("");
    setGender("");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !age || !gender) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await addPatient.mutateAsync({
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        age: BigInt(age),
        gender,
      });
      toast.success(`Patient "${name}" added successfully`);
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add patient");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="add_patient.dialog">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add New Patient
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="pat-name">Full Name</Label>
            <Input
              id="pat-name"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="add_patient.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pat-phone">Phone Number</Label>
            <Input
              id="pat-phone"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              data-ocid="add_patient.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pat-age">Age</Label>
              <Input
                id="pat-age"
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                data-ocid="add_patient.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger data-ocid="add_patient.select">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-ocid="add_patient.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addPatient.isPending}
            data-ocid="add_patient.submit_button"
          >
            {addPatient.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
