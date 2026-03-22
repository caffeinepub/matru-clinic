import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Prescription = {
    medicines : [Text];
    notes : Text;
    consultationFee : Nat;
  };

  type Patient = {
    id : Text;
    name : Text;
    phone : Text;
    age : Nat;
    gender : Text;
    status : Text;
    prescription : Prescription;
    createdAt : Int;
  };

  type Medicine = {
    id : Text;
    name : Text;
    dosageHint : Text;
  };

  module Patient {
    public func compare(p1 : Patient, p2 : Patient) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  // Stable storage - persists across upgrades
  var patients : [Patient] = [];
  var medicines : [Medicine] = [];

  // --- Patient functions ---

  public shared ({ caller }) func addPatient(id : Text, name : Text, phone : Text, age : Nat, gender : Text) : async () {
    let exists = patients.find(func(p : Patient) : Bool { p.id == id });
    switch (exists) {
      case (?_) { Runtime.trap("Patient already exists") };
      case (null) {};
    };
    let newPatient : Patient = {
      id;
      name;
      phone;
      age;
      gender;
      status = "waiting";
      prescription = { medicines = []; notes = ""; consultationFee = 0 };
      createdAt = Time.now();
    };
    patients := patients.concat([newPatient]);
  };

  public query ({ caller }) func getPatient(id : Text) : async Patient {
    switch (patients.find(func(p : Patient) : Bool { p.id == id })) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?p) { p };
    };
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    patients;
  };

  public shared ({ caller }) func updatePatientStatus(id : Text, status : Text) : async () {
    patients := patients.map(func(p : Patient) : Patient {
      if (p.id == id) { { p with status } } else { p }
    });
  };

  public shared ({ caller }) func updatePrescription(id : Text, meds : [Text], notes : Text, fee : Nat) : async () {
    patients := patients.map(func(p : Patient) : Patient {
      if (p.id == id) {
        { p with prescription = { medicines = meds; notes; consultationFee = fee } }
      } else { p }
    });
  };

  public shared ({ caller }) func markAsPaid(id : Text) : async () {
    patients := patients.map(func(p : Patient) : Patient {
      if (p.id == id) { { p with status = "paid" } } else { p }
    });
  };

  public shared ({ caller }) func deletePatient(id : Text) : async () {
    patients := patients.filter(func(p : Patient) : Bool { p.id != id });
  };

  // --- Medicine catalog functions ---

  public shared ({ caller }) func addMedicine(id : Text, name : Text, dosageHint : Text) : async () {
    let exists = medicines.find(func(m : Medicine) : Bool { m.id == id });
    switch (exists) {
      case (?_) { Runtime.trap("Medicine already exists") };
      case (null) {};
    };
    medicines := medicines.concat([{ id; name; dosageHint }]);
  };

  public query ({ caller }) func getAllMedicines() : async [Medicine] {
    medicines;
  };

  public shared ({ caller }) func deleteMedicine(id : Text) : async () {
    medicines := medicines.filter(func(m : Medicine) : Bool { m.id != id });
  };
};
