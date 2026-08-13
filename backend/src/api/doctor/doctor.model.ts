import mongoose, { type Model } from "mongoose";
const { model, models, Schema } = mongoose;

export type Doctor = {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const doctorSchema = new Schema<Doctor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    hospital: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

doctorSchema.index({ name: "text", specialization: "text", hospital: "text", email: "text", phone: "text" });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1 });

export const DoctorModel = (models.Doctor as Model<Doctor> | undefined) ?? model<Doctor>("Doctor", doctorSchema);
