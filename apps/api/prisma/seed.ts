import bcrypt from "bcryptjs";
import { PrismaClient, Gender, Role, Triage } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const [admin, doctor, nurse] = await Promise.all(
    [
      { email: "admin@healthnest.test", name: "Avery Brooks", role: Role.ADMIN },
      { email: "doctor@healthnest.test", name: "Dr. Mira Shah", role: Role.DOCTOR },
      { email: "nurse@healthnest.test", name: "Noah Patel", role: Role.NURSE }
    ].map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, role: user.role, passwordHash },
        create: { ...user, passwordHash }
      })
    )
  );

  const patientOne = await prisma.patient.upsert({
    where: { id: "11111111-1111-4111-8111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Mary Carter",
      age: 54,
      gender: Gender.FEMALE,
      contact: "+1 555 0142",
      address: "82 Garden Street, Austin, TX",
      medicalHistory: "Type 2 diabetes, hypertension, atorvastatin intolerance.",
      createdById: nurse.id
    }
  });

  const patientTwo = await prisma.patient.upsert({
    where: { id: "22222222-2222-4222-8222-222222222222" },
    update: {},
    create: {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Daniel Lopez",
      age: 38,
      gender: Gender.MALE,
      contact: "+1 555 0188",
      address: "14 North Creek Road, Denver, CO",
      medicalHistory: "Seasonal allergies. No known drug allergies.",
      createdById: admin.id
    }
  });

  await Promise.all(
    [
      prisma.opdVisit.upsert({
        where: { id: "33333333-3333-4333-8333-333333333333" },
        update: {},
        create: {
          id: "33333333-3333-4333-8333-333333333333",
          patientId: patientOne.id,
          clinicianId: doctor.id,
          date: new Date(),
          symptoms: "Fatigue and elevated home glucose readings.",
          diagnosis: "Suboptimal diabetes control; review medication adherence.",
          prescription: "Continue metformin. Add nutrition consult. Repeat HbA1c in 3 months.",
          followUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21)
        }
      }),
      prisma.opdVisit.upsert({
        where: { id: "44444444-4444-4444-8444-444444444444" },
        update: {},
        create: {
          id: "44444444-4444-4444-8444-444444444444",
          patientId: patientTwo.id,
          clinicianId: doctor.id,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          symptoms: "Annual preventive visit.",
          diagnosis: "Well adult exam.",
          prescription: "Routine labs, influenza vaccine, exercise counseling."
        }
      })
    ]
  );

  await prisma.emergencyCase.upsert({
    where: { id: "55555555-5555-4555-8555-555555555555" },
    update: {},
    create: {
      id: "55555555-5555-4555-8555-555555555555",
      patientName: "Lina Moore",
      age: 29,
      gender: Gender.FEMALE,
      contact: "+1 555 0199",
      chiefComplaint: "Severe abdominal pain",
      triage: Triage.CRITICAL,
      createdById: nurse.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
