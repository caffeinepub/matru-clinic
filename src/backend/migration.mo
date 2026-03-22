import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";

module {
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

  type OldActor = {
    patients : Map.Map<Text, Patient>;
  };

  type NewActor = {
    patients : [Patient];
  };

  public func run(old : OldActor) : NewActor {
    {
      patients = old.patients.values().toArray();
    };
  };
};
