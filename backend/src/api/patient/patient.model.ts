import mongoose, { type Model } from "mongoose";

const { model, models, Schema } = mongoose;

export const PATIENT_CONDITIONS = ["stable", "critical", "recovering", "observation"] as const;
export const PATIENT_STATUSES = ["scheduled", "admitted", "discharged", "follow-up"] as const;
export const PATIENT_GENDERS = ["male", "female", "other"] as const;

export type Patient = {
  doctorId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender: (typeof PATIENT_GENDERS)[number];
  condition: (typeof PATIENT_CONDITIONS)[number];
  status: (typeof PATIENT_STATUSES)[number];
  visitDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const patientSchema = new Schema<Patient>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    age: {
      type: Number,
      min: 0,
      max: 130,
    },
    gender: {
      type: String,
      enum: PATIENT_GENDERS,
      required: true,
    },
    condition: {
      type: String,
      enum: PATIENT_CONDITIONS,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: PATIENT_STATUSES,
      default: "scheduled",
      index: true,
    },
    visitDate: {
      type: Date,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true, versionKey: false }
);

patientSchema.index({ name: "text", phone: "text", email: "text", condition: "text", status: "text" });
patientSchema.index({ doctorId: 1, visitDate: -1 });
patientSchema.index({ condition: 1, visitDate: -1 });
patientSchema.index({ createdAt: -1 });

export const PatientModel = (models.Patient as Model<Patient> | undefined) ?? model<Patient>("Patient", patientSchema);
