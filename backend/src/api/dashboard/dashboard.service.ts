import { DoctorModel } from "@/api/doctor/doctor.model";
import { PatientModel } from "@/api/patient/patient.model";

export const getDashboardSummary = async () => {
  const [totalDoctors, totalPatients, patientsPerDoctor, patientsByCondition, dateBasedStats] = await Promise.all([
    DoctorModel.countDocuments(),
    PatientModel.countDocuments(),
    PatientModel.aggregate([
      { $group: { _id: "$doctorId", patientCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          _id: 0,
          doctorId: "$_id",
          doctorName: "$doctor.name",
          specialization: "$doctor.specialization",
          patientCount: 1,
        },
      },
      { $sort: { patientCount: -1, doctorName: 1 } },
      { $limit: 10 },
    ]),
    PatientModel.aggregate([
      { $group: { _id: "$condition", count: { $sum: 1 } } },
      { $project: { _id: 0, condition: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]),
    PatientModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$visitDate",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } },
      { $limit: 30 },
    ]),
  ]);

  return {
    totals: {
      doctors: totalDoctors,
      patients: totalPatients,
    },
    patientsPerDoctor,
    patientsByCondition,
    dateBasedStats,
  };
};
