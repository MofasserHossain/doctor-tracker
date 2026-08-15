import { hash } from "bcryptjs";
import type { Express } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

type ServiceResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
};

type ErrorResponse = {
  success: boolean;
  code: number;
  message: string;
};

type CursorPage<T> = {
  records: T[];
  meta: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
};

type AuthUserRecord = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
};

type DoctorRecord = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
};

type DoctorSummaryRecord = Pick<DoctorRecord, "_id" | "name" | "specialization" | "hospital">;

type PatientRecord = {
  _id: string;
  doctorId: string | DoctorSummaryRecord;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender: "male" | "female" | "other";
  condition: "stable" | "critical" | "recovering" | "observation";
  status: "scheduled" | "admitted" | "discharged" | "follow-up";
  visitDate: string;
  notes?: string;
};

type DashboardSummaryRecord = {
  totals: {
    doctors: number;
    patients: number;
  };
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }>;
  patientsByCondition: Array<{
    condition: PatientRecord["condition"];
    count: number;
  }>;
  dateBasedStats: Array<{
    date: string;
    count: number;
  }>;
};

type SeedSummaryRecord = {
  adminEmail: string;
  doctorCount: number;
  patientCount: number;
};

type SeededData = {
  doctors: {
    cardiologist: string;
    dermatologist: string;
    neurologist: string;
  };
  patients: {
    critical: string;
    observation: string;
    recovering: string;
    stable: string;
  };
};

const adminEmail = "admin@doctortracker.local";
const adminPassword = "Admin@12345";
const seedSecret = "test-seed-secret";

let app: Express;
let mongoServer: MongoMemoryServer;
let DoctorModel: typeof import("@/api/doctor/doctor.model").DoctorModel;
let PatientModel: typeof import("@/api/patient/patient.model").PatientModel;
let UserModel: typeof import("@/api/auth/user.model").UserModel;
let seeded: SeededData;

const patientPayload = {
  name: "Aminul Islam",
  phone: "+8801710000000",
  email: "aminul@example.com",
  age: 45,
  gender: "male",
  condition: "stable",
  status: "scheduled",
  visitDate: "2026-08-10",
  notes: "Initial consultation",
} satisfies Omit<PatientRecord, "_id" | "doctorId">;

const getDoctorId = (doctorId: PatientRecord["doctorId"]) => {
  return typeof doctorId === "string" ? doctorId : doctorId._id;
};

const getAuthenticatedAgent = async () => {
  const agent = request.agent(app);

  await agent.post("/api/v1/auth/login").send({ email: adminEmail, password: adminPassword }).expect(200);

  return agent;
};

const seedDatabase = async (): Promise<SeededData> => {
  await Promise.all([UserModel.deleteMany({}), DoctorModel.deleteMany({}), PatientModel.deleteMany({})]);

  await UserModel.create({
    name: "Admin User",
    email: adminEmail,
    password: await hash(adminPassword, 4),
    role: "ADMIN",
  });

  const [cardiologist, neurologist, dermatologist] = await DoctorModel.create([
    {
      name: "Dr. Ayesha Rahman",
      specialization: "Cardiology",
      hospital: "Care Guide Medical Center",
      phone: "+8801711111111",
      email: "ayesha.rahman@example.com",
    },
    {
      name: "Dr. Tanvir Hasan",
      specialization: "Neurology",
      hospital: "City Neuro Hospital",
      phone: "+8801711111112",
      email: "tanvir.hasan@example.com",
    },
    {
      name: "Dr. Farhana Sultana",
      specialization: "Dermatology",
      hospital: "Metro Skin Clinic",
      phone: "+8801711111113",
      email: "farhana.sultana@example.com",
    },
  ]);

  if (!cardiologist || !neurologist || !dermatologist) {
    throw new Error("Doctor seed failed");
  }

  const [stable, critical, recovering, observation] = await PatientModel.create([
    {
      doctorId: cardiologist._id,
      name: "Nusrat Karim",
      phone: "+8801811111111",
      email: "nusrat@example.com",
      age: 42,
      gender: "female",
      condition: "stable",
      status: "scheduled",
      visitDate: new Date("2026-08-01T10:00:00.000Z"),
      notes: "Routine cardiac follow-up",
    },
    {
      doctorId: cardiologist._id,
      name: "Mina Chowdhury",
      phone: "+8801811111112",
      email: "mina@example.com",
      age: 58,
      gender: "female",
      condition: "critical",
      status: "admitted",
      visitDate: new Date("2026-08-02T10:00:00.000Z"),
      notes: "Chest pain and shortness of breath",
    },
    {
      doctorId: neurologist._id,
      name: "Jamil Ahmed",
      phone: "+8801811111113",
      email: "jamil@example.com",
      age: 36,
      gender: "male",
      condition: "recovering",
      status: "follow-up",
      visitDate: new Date("2026-08-03T10:00:00.000Z"),
      notes: "Migraine symptoms improving",
    },
    {
      doctorId: dermatologist._id,
      name: "Rafi Hossain",
      phone: "+8801811111114",
      email: "rafi@example.com",
      age: 29,
      gender: "male",
      condition: "observation",
      status: "discharged",
      visitDate: new Date("2026-08-04T10:00:00.000Z"),
      notes: "Skin rash under review",
    },
  ]);

  if (!stable || !critical || !recovering || !observation) {
    throw new Error("Patient seed failed");
  }

  return {
    doctors: {
      cardiologist: String(cardiologist._id),
      dermatologist: String(dermatologist._id),
      neurologist: String(neurologist._id),
    },
    patients: {
      critical: String(critical._id),
      observation: String(observation._id),
      recovering: String(recovering._id),
      stable: String(stable._id),
    },
  };
};

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.CORS_ORIGIN = "http://localhost:3000";
  process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough-for-tests";
  process.env.SEED_SECRET = seedSecret;
  process.env.AUTH_RATE_LIMIT_MAX = "1000";
  process.env.API_RATE_LIMIT_MAX = "1000";
  process.env.BCRYPT_SALT_ROUNDS = "4";

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri("doctor_tracker_test");
  process.env.MONGODB_URI = mongoUri;

  ({ app } = await import("@/server"));
  ({ DoctorModel } = await import("@/api/doctor/doctor.model"));
  ({ PatientModel } = await import("@/api/patient/patient.model"));
  ({ UserModel } = await import("@/api/auth/user.model"));

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  seeded = await seedDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Doctor Tracker API", () => {
  describe("health routes", () => {
    it("returns health status on the health-check path", async () => {
      const response = await request(app).get("/api/v1/health-check").expect(200);
      const body = response.body as ServiceResponse<{
        uptime: number;
        timestamp: string;
        database: string;
      }>;

      expect(body.success).toBe(true);
      expect(body.message).toBe("Health check passed");
      expect(body.data).toEqual({
        uptime: expect.any(Number),
        timestamp: expect.any(String),
        database: expect.any(String),
      });
    });

    it("returns not found for unsupported API routes", async () => {
      const response = await request(app).get("/api/v1/health").expect(404);
      const body = response.body as ErrorResponse;

      expect(body.success).toBe(false);
      expect(body.message).toBe("Not found");
    });
  });

  describe("auth routes", () => {
    it("rejects protected endpoints without a valid session", async () => {
      const response = await request(app).get("/api/v1/dashboard/summary").expect(401);
      const body = response.body as ErrorResponse;

      expect(body.success).toBe(false);
      expect(body.message).toBe("Unauthorized");
    });

    it("logs in with seeded admin credentials, returns the current user, and clears the session on logout", async () => {
      const agent = request.agent(app);

      const loginResponse = await agent
        .post("/api/v1/auth/login")
        .send({ email: adminEmail, password: adminPassword })
        .expect(200);
      const loginBody = loginResponse.body as ServiceResponse<{ user: AuthUserRecord }>;
      const setCookieHeader = loginResponse.headers["set-cookie"];
      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [String(setCookieHeader)];

      expect(loginBody.data.user).toMatchObject({
        email: adminEmail,
        name: "Admin User",
        role: "ADMIN",
      });
      expect(cookies.some((cookie) => cookie.startsWith("accessToken="))).toBe(true);

      const meResponse = await agent.get("/api/v1/auth/me").expect(200);
      const meBody = meResponse.body as ServiceResponse<{ user: AuthUserRecord }>;

      expect(meBody.data.user.email).toBe(adminEmail);

      await agent.post("/api/v1/auth/logout").expect(200);
      await agent.get("/api/v1/auth/me").expect(401);
    });

    it("rejects incorrect credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: adminEmail, password: "Wrong@12345" })
        .expect(400);
      const body = response.body as ErrorResponse;

      expect(body.message).toBe("Incorrect email or password");
    });
  });

  describe("seed route", () => {
    it("rejects requests without the seed secret", async () => {
      const response = await request(app).post("/api/v1/seed").expect(401);
      const body = response.body as ErrorResponse;

      expect(body.message).toBe("Unauthorized");
    });

    it("rejects requests with an incorrect seed secret", async () => {
      const response = await request(app).post("/api/v1/seed").set("x-seed-secret", "wrong-secret").expect(401);
      const body = response.body as ErrorResponse;

      expect(body.message).toBe("Unauthorized");
    });

    it("seeds the database with the correct secret without duplicating records", async () => {
      await Promise.all([UserModel.deleteMany({}), DoctorModel.deleteMany({}), PatientModel.deleteMany({})]);

      const firstResponse = await request(app).post("/api/v1/seed").set("x-seed-secret", seedSecret).expect(200);
      const firstBody = firstResponse.body as ServiceResponse<SeedSummaryRecord>;

      expect(firstBody.message).toBe("Seed completed");
      expect(firstBody.data).toMatchObject({
        adminEmail,
        doctorCount: 12,
        patientCount: 38,
      });
      await expect(UserModel.countDocuments()).resolves.toBe(1);
      await expect(DoctorModel.countDocuments()).resolves.toBe(12);
      await expect(PatientModel.countDocuments()).resolves.toBe(38);

      await request(app).post("/api/v1/seed").set("x-seed-secret", seedSecret).expect(200);

      await expect(UserModel.countDocuments()).resolves.toBe(1);
      await expect(DoctorModel.countDocuments()).resolves.toBe(12);
      await expect(PatientModel.countDocuments()).resolves.toBe(38);
    });
  });

  describe("dashboard routes", () => {
    it("summarizes doctors, patients, conditions, and visit dates", async () => {
      const agent = await getAuthenticatedAgent();
      const response = await agent.get("/api/v1/dashboard/summary").expect(200);
      const body = response.body as ServiceResponse<DashboardSummaryRecord>;
      const conditionCounts = Object.fromEntries(
        body.data.patientsByCondition.map((item) => [item.condition, item.count])
      );

      expect(body.data.totals).toEqual({ doctors: 3, patients: 4 });
      expect(body.data.patientsPerDoctor).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            doctorName: "Dr. Ayesha Rahman",
            patientCount: 2,
            specialization: "Cardiology",
          }),
        ])
      );
      expect(conditionCounts).toMatchObject({
        critical: 1,
        observation: 1,
        recovering: 1,
        stable: 1,
      });
      expect(body.data.dateBasedStats).toEqual(
        expect.arrayContaining([expect.objectContaining({ date: "2026-08-02", count: 1 })])
      );
    });
  });

  describe("doctor routes", () => {
    it("paginates and filters doctors by search, specialization, and hospital", async () => {
      const agent = await getAuthenticatedAgent();
      const firstPageResponse = await agent.get("/api/v1/doctors").query({ limit: 1 }).expect(200);
      const firstPage = firstPageResponse.body as ServiceResponse<CursorPage<DoctorRecord>>;
      const firstRecord = firstPage.data.records[0];
      const nextCursor = firstPage.data.meta.nextCursor;

      if (!firstRecord || !nextCursor) {
        throw new Error("Expected first doctor page to include a next cursor");
      }

      expect(firstPage.data.records).toHaveLength(1);
      expect(firstPage.data.meta).toMatchObject({ hasNextPage: true, limit: 1 });

      const nextPageResponse = await agent.get("/api/v1/doctors").query({ cursor: nextCursor, limit: 1 }).expect(200);
      const nextPage = nextPageResponse.body as ServiceResponse<CursorPage<DoctorRecord>>;

      expect(nextPage.data.records[0]?._id).not.toBe(firstRecord._id);

      const searchResponse = await agent.get("/api/v1/doctors").query({ search: "cardio" }).expect(200);
      const searchBody = searchResponse.body as ServiceResponse<CursorPage<DoctorRecord>>;

      expect(searchBody.data.records.map((doctor) => doctor.name)).toEqual(["Dr. Ayesha Rahman"]);

      const filteredResponse = await agent
        .get("/api/v1/doctors")
        .query({ hospital: "neuro", specialization: "neuro" })
        .expect(200);
      const filteredBody = filteredResponse.body as ServiceResponse<CursorPage<DoctorRecord>>;

      expect(filteredBody.data.records.map((doctor) => doctor.name)).toEqual(["Dr. Tanvir Hasan"]);
    });

    it("creates, updates, fetches, and deletes an unassigned doctor", async () => {
      const agent = await getAuthenticatedAgent();
      const createResponse = await agent
        .post("/api/v1/doctors")
        .send({
          name: "Dr. Mahmud Alam",
          specialization: "Pediatrics",
          hospital: "Children Care Clinic",
          phone: "+8801711111199",
          email: "mahmud.alam@example.com",
        })
        .expect(201);
      const createdDoctor = (createResponse.body as ServiceResponse<DoctorRecord>).data;

      await agent.get(`/api/v1/doctors/${createdDoctor._id}`).expect(200);

      const updateResponse = await agent
        .patch(`/api/v1/doctors/${createdDoctor._id}`)
        .send({ hospital: "Children Care Hospital" })
        .expect(200);
      const updatedDoctor = (updateResponse.body as ServiceResponse<DoctorRecord>).data;

      expect(updatedDoctor.hospital).toBe("Children Care Hospital");

      const deleteResponse = await agent.delete(`/api/v1/doctors/${createdDoctor._id}`).expect(200);
      const deletedDoctor = (deleteResponse.body as ServiceResponse<DoctorRecord>).data;

      expect(deletedDoctor._id).toBe(createdDoctor._id);
      await agent.get(`/api/v1/doctors/${createdDoctor._id}`).expect(404);
    });

    it("prevents deleting a doctor who still owns patients", async () => {
      const agent = await getAuthenticatedAgent();
      const response = await agent.delete(`/api/v1/doctors/${seeded.doctors.cardiologist}`).expect(400);
      const body = response.body as ErrorResponse;

      expect(body.message).toMatch(/reassign this doctor's patients/i);
    });
  });

  describe("patient routes", () => {
    it("filters patients by doctor, condition, status, date range, and search", async () => {
      const agent = await getAuthenticatedAgent();

      const doctorResponse = await agent
        .get("/api/v1/patients")
        .query({ doctorId: seeded.doctors.cardiologist })
        .expect(200);
      const doctorBody = doctorResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(doctorBody.data.records).toHaveLength(2);
      expect(
        doctorBody.data.records.every((patient) => getDoctorId(patient.doctorId) === seeded.doctors.cardiologist)
      ).toBe(true);

      const statusResponse = await agent.get("/api/v1/patients").query({ status: "admitted" }).expect(200);
      const statusBody = statusResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(statusBody.data.records.map((patient) => patient.name)).toEqual(["Mina Chowdhury"]);

      const conditionResponse = await agent.get("/api/v1/patients").query({ condition: "recovering" }).expect(200);
      const conditionBody = conditionResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(conditionBody.data.records.map((patient) => patient.name)).toEqual(["Jamil Ahmed"]);

      const dateResponse = await agent
        .get("/api/v1/patients")
        .query({ from: "2026-08-04", to: "2026-08-04" })
        .expect(200);
      const dateBody = dateResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(dateBody.data.records.map((patient) => patient.name)).toEqual(["Rafi Hossain"]);

      const searchResponse = await agent.get("/api/v1/patients").query({ search: "migraine" }).expect(200);
      const searchBody = searchResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(searchBody.data.records.map((patient) => patient._id)).toEqual([seeded.patients.recovering]);
    });

    it("creates, updates, and deletes patients through patient endpoints", async () => {
      const agent = await getAuthenticatedAgent();
      const createResponse = await agent
        .post("/api/v1/patients")
        .send({ ...patientPayload, doctorId: seeded.doctors.neurologist })
        .expect(201);
      const createdPatient = (createResponse.body as ServiceResponse<PatientRecord>).data;

      expect(getDoctorId(createdPatient.doctorId)).toBe(seeded.doctors.neurologist);

      const updateResponse = await agent
        .patch(`/api/v1/patients/${createdPatient._id}`)
        .send({ notes: "Moved to overnight observation", status: "admitted" })
        .expect(200);
      const updatedPatient = (updateResponse.body as ServiceResponse<PatientRecord>).data;

      expect(updatedPatient.status).toBe("admitted");
      expect(updatedPatient.notes).toBe("Moved to overnight observation");

      await agent.delete(`/api/v1/patients/${createdPatient._id}`).expect(200);
      await agent.get(`/api/v1/patients/${createdPatient._id}`).expect(404);
    });

    it("validates patient doctor assignment on direct patient creation", async () => {
      const agent = await getAuthenticatedAgent();
      const missingDoctorResponse = await agent.post("/api/v1/patients").send(patientPayload).expect(400);
      const unknownDoctorResponse = await agent
        .post("/api/v1/patients")
        .send({ ...patientPayload, doctorId: new mongoose.Types.ObjectId().toString() })
        .expect(404);

      expect((missingDoctorResponse.body as ErrorResponse).message).toBe("doctorId is required");
      expect((unknownDoctorResponse.body as ErrorResponse).message).toBe("Doctor not found");
    });

    it("supports nested doctor-patient create, list, and delete routes", async () => {
      const agent = await getAuthenticatedAgent();
      const createResponse = await agent
        .post(`/api/v1/doctors/${seeded.doctors.dermatologist}/patients`)
        .send({
          ...patientPayload,
          email: "nested-patient@example.com",
          name: "Sadia Noor",
          phone: "+8801712222299",
        })
        .expect(201);
      const createdPatient = (createResponse.body as ServiceResponse<PatientRecord>).data;

      expect(getDoctorId(createdPatient.doctorId)).toBe(seeded.doctors.dermatologist);

      const listResponse = await agent.get(`/api/v1/doctors/${seeded.doctors.dermatologist}/patients`).expect(200);
      const listBody = listResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(listBody.data.records.map((patient) => patient._id)).toEqual(expect.arrayContaining([createdPatient._id]));
      expect(listBody.data.meta).toMatchObject({ limit: 10 });

      const pagedResponse = await agent
        .get(`/api/v1/doctors/${seeded.doctors.dermatologist}/patients`)
        .query({ limit: 1 })
        .expect(200);
      const pagedBody = pagedResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(pagedBody.data.records).toHaveLength(1);
      expect(pagedBody.data.meta).toMatchObject({ limit: 1 });

      await agent.delete(`/api/v1/doctors/${seeded.doctors.dermatologist}/patients/${createdPatient._id}`).expect(200);

      const afterDeleteResponse = await agent
        .get(`/api/v1/doctors/${seeded.doctors.dermatologist}/patients`)
        .expect(200);
      const afterDeleteBody = afterDeleteResponse.body as ServiceResponse<CursorPage<PatientRecord>>;

      expect(afterDeleteBody.data.records.map((patient) => patient._id)).not.toContain(createdPatient._id);
    });
  });
});
