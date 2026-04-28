import type { Request, Response } from "express";
import { EmergencyStatus, Triage } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

export async function getStats(_req: Request, res: Response) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalPatients, activeEmergencyCases, criticalEmergencyCases, todaysOpdVisits, pendingFollowUps] =
    await Promise.all([
      prisma.patient.count(),
      prisma.emergencyCase.count({ where: { status: { not: EmergencyStatus.DISCHARGED } } }),
      prisma.emergencyCase.count({
        where: { status: { not: EmergencyStatus.DISCHARGED }, triage: Triage.CRITICAL }
      }),
      prisma.opdVisit.count({ where: { date: { gte: today } } }),
      prisma.opdVisit.count({
        where: {
          followUpAt: {
            gte: today
          }
        }
      })
    ]);

  res.json({
    totalPatients,
    activeCases: activeEmergencyCases + todaysOpdVisits + pendingFollowUps,
    emergencyCases: activeEmergencyCases,
    criticalEmergencyCases,
    todaysOpdVisits,
    pendingFollowUps
  });
}
