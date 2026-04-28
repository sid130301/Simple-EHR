import PDFDocument from "pdfkit";
import type { Prisma } from "@prisma/client";

export type PatientWithVisits = Prisma.PatientGetPayload<{
  include: {
    opdVisits: true;
  };
}>;

export function createPatientPdf(patient: PatientWithVisits): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).fillColor("#0f3d37").text("HealthNest EHR", { continued: false });
    doc.moveDown(0.4);
    doc.fontSize(15).fillColor("#111827").text("Patient Summary");
    doc.moveDown();

    doc.fontSize(12).fillColor("#111827");
    doc.text(`Name: ${patient.name}`);
    doc.text(`Age: ${patient.age}`);
    doc.text(`Gender: ${patient.gender}`);
    doc.text(`Contact: ${patient.contact}`);
    doc.text(`Address: ${patient.address || "Not provided"}`);
    doc.moveDown();

    doc.fontSize(14).fillColor("#0f3d37").text("Medical History");
    doc.fontSize(11).fillColor("#111827").text(patient.medicalHistory || "No history recorded.");
    doc.moveDown();

    doc.fontSize(14).fillColor("#0f3d37").text("OPD Visits");
    if (!patient.opdVisits.length) {
      doc.fontSize(11).fillColor("#111827").text("No OPD visits recorded.");
    }

    patient.opdVisits.forEach((visit, index) => {
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#111827").text(`${index + 1}. ${visit.date.toDateString()}`);
      doc.fontSize(10).text(`Symptoms: ${visit.symptoms}`);
      doc.text(`Diagnosis: ${visit.diagnosis}`);
      doc.text(`Prescription: ${visit.prescription}`);
      if (visit.followUpAt) {
        doc.text(`Follow-up: ${visit.followUpAt.toDateString()}`);
      }
    });

    doc.end();
  });
}
