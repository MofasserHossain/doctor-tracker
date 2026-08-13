import { UserModel } from "@/api/auth/user.model";
import { DoctorModel } from "@/api/doctor/doctor.model";
import { PatientModel } from "@/api/patient/patient.model";
import { connectToDatabase, disconnectFromDatabase } from "@/common/db/db";
import { env } from "@/common/utils/envConfig";
import { hash } from "bcryptjs";

const adminCredentials = {
  name: "Admin User",
  email: "admin@doctortracker.local",
  password: "Admin@12345",
};

const doctors = [
  {
    name: "Dr. Ayesha Rahman",
    specialization: "Cardiology",
    hospital: "Care Guide Medical Center",
    phone: "+8801711000001",
    email: "ayesha.rahman@example.com",
  },
  {
    name: "Dr. Tanvir Hasan",
    specialization: "Neurology",
    hospital: "City Health Hospital",
    phone: "+8801711000002",
    email: "tanvir.hasan@example.com",
  },
  {
    name: "Dr. Nusrat Karim",
    specialization: "Pediatrics",
    hospital: "Metro Children Hospital",
    phone: "+8801711000003",
    email: "nusrat.karim@example.com",
  },
];

const main = async () => {
  await connectToDatabase();

  const passwordHash = await hash(adminCredentials.password, env.BCRYPT_SALT_ROUNDS);

  await UserModel.updateOne(
    { email: adminCredentials.email },
    {
      $set: {
        name: adminCredentials.name,
        email: adminCredentials.email,
        password: passwordHash,
        role: "ADMIN",
      },
    },
    { upsert: true }
  );

  if ((await DoctorModel.countDocuments()) === 0) {
    const createdDoctors = await DoctorModel.insertMany(doctors);

    await PatientModel.insertMany([
      {
        doctorId: createdDoctors[0]?._id,
        name: "Mahmudul Islam",
        phone: "+8801811000001",
        email: "mahmudul@example.com",
        age: 46,
        gender: "male",
        condition: "stable",
        status: "follow-up",
        visitDate: new Date(),
        notes: "Routine cardiac follow-up.",
      },
      {
        doctorId: createdDoctors[0]?._id,
        name: "Farhana Akter",
        phone: "+8801811000002",
        email: "farhana@example.com",
        age: 58,
        gender: "female",
        condition: "critical",
        status: "admitted",
        visitDate: new Date(Date.now() - 86400000),
        notes: "Requires close monitoring.",
      },
      {
        doctorId: createdDoctors[1]?._id,
        name: "Sajid Hossain",
        phone: "+8801811000003",
        age: 37,
        gender: "male",
        condition: "observation",
        status: "scheduled",
        visitDate: new Date(Date.now() + 86400000),
      },
      {
        doctorId: createdDoctors[2]?._id,
        name: "Nabila Khan",
        phone: "+8801811000004",
        age: 8,
        gender: "female",
        condition: "recovering",
        status: "follow-up",
        visitDate: new Date(Date.now() - 172800000),
      },
    ]);
  }

  await disconnectFromDatabase();

  console.info("Seed completed");
  console.info(`Admin email: ${adminCredentials.email}`);
  console.info(`Admin password: ${adminCredentials.password}`);
};

void main().catch(async (error) => {
  console.error(error);
  await disconnectFromDatabase();
  process.exit(1);
});
