from __future__ import annotations

from copy import deepcopy


APP_DATA = {
    "user": {
        "name": "Dr. Sofia Bennett",
        "org": "SoloCare Family Clinic",
    },
    "patients": [
        {
            "id": "p-1001",
            "name": "Mary Carter",
            "age": 67,
            "sex": "F",
            "dob": "1958-02-14",
            "mrn": "SC-1001",
            "insurance": "Medicare",
            "reason_for_visit": "Diabetes follow-up",
            "what_matters_now": (
                "Home sugars are running higher this month, blood pressure is improving, "
                "and she wants a simple medication plan she can follow consistently."
            ),
            "memory": (
                "Lives alone, keeps a paper medication list in her purse, prefers plain-language "
                "instructions, and does best with a short plan."
            ),
            "flags": ["Diabetes", "HTN", "Due for foot exam"],
            "allergies": ["Penicillin"],
            "active_problems": [
                "Type 2 diabetes mellitus",
                "Essential hypertension",
                "Hyperlipidemia",
            ],
            "care_goals": [
                "Bring A1c below 7.5 within 3 months",
                "Keep home BP under 140/90",
                "Complete annual diabetic foot exam",
            ],
            "metrics": {
                "A1c": "8.1%",
                "BP": "138/84",
                "eGFR": "68",
                "Open loops": "2",
            },
            "meds": [
                "Metformin ER 500 mg BID - mild nausea if taken without food",
                "Glipizide 5 mg daily - review for dose increase if sugars stay high",
                "Lisinopril 20 mg daily - BP improving",
                "Atorvastatin 20 mg nightly - no side effects reported",
            ],
            "labs": [
                "Hemoglobin A1c: 8.1% (up from 7.6%)",
                "Creatinine: 0.9 mg/dL (stable)",
                "LDL: 86 mg/dL (improved)",
            ],
            "timeline": [
                "2026-04-18 - Primary care follow-up: reviewed diabetes control and home BP log.",
                "2026-04-11 - Lab result: A1c 8.1%.",
                "2026-04-05 - Message: requested 90-day refill.",
            ],
            "messages": [
                "Mary Carter: Can I get a 90-day refill? It would help me not make so many pharmacy trips.",
                "Clinic: We will review your medications at today's visit and send updates after the appointment.",
            ],
            "billing": {
                "Last claim": "99214 paid on 2026-03-09",
                "Balance": "$25 copay due",
                "Status": "Collect at checkout",
            },
            "visit_note": (
                "Assessment: Type 2 diabetes remains above goal, but patient is adherent and motivated. "
                "Blood pressure is improving. No hypoglycemia reported.\n\n"
                "Plan:\n"
                "- Continue metformin and glipizide for now.\n"
                "- Review diet and home glucose log.\n"
                "- Perform diabetic foot exam today.\n"
                "- Send 90-day refills after medication reconciliation."
            ),
            "instructions": (
                "Take your medications with meals as directed, keep checking your blood sugar at home, "
                "and bring your glucose and blood pressure readings to the next visit."
            ),
            "orders": [
                "Hemoglobin A1c",
                "Diabetic foot exam",
                "90-day medication refill",
            ],
        },
        {
            "id": "p-1002",
            "name": "Daniel Lopez",
            "age": 51,
            "sex": "M",
            "dob": "1975-09-03",
            "mrn": "SC-1002",
            "insurance": "Blue Cross PPO",
            "reason_for_visit": "Annual wellness visit",
            "what_matters_now": (
                "He feels generally well, wants to stay active, and mainly needs routine preventive care "
                "with a clean visit summary."
            ),
            "memory": (
                "Prefers quick visits and digital follow-up. Usually completes labs promptly if ordered "
                "before noon."
            ),
            "flags": ["Annual physical", "Colon screening due"],
            "allergies": ["None known"],
            "active_problems": [
                "Hyperlipidemia",
                "Preventive care maintenance",
            ],
            "care_goals": [
                "Complete preventive screening",
                "Maintain exercise routine",
                "Review lab results in portal",
            ],
            "metrics": {
                "A1c": "5.8%",
                "BP": "124/78",
                "eGFR": "95",
                "Open loops": "1",
            },
            "meds": [
                "Rosuvastatin 10 mg nightly - well tolerated",
            ],
            "labs": [
                "Lipid panel: pending",
                "CMP: pending",
            ],
            "timeline": [
                "2026-04-18 - Annual physical scheduled with fasting labs and screening review.",
            ],
            "messages": [
                "Daniel Lopez: Should I still do the labs if I had coffee this morning?",
            ],
            "billing": {
                "Last claim": "99396 paid on 2025-11-02",
                "Balance": "$0 due",
                "Status": "Clear",
            },
            "visit_note": (
                "Assessment: Preventive visit with stable chronic issues and no acute complaints.\n\n"
                "Plan:\n"
                "- Order preventive labs.\n"
                "- Review colon cancer screening options.\n"
                "- Continue exercise and statin therapy."
            ),
            "instructions": (
                "Complete your lab work, review the screening options discussed today, "
                "and continue your walking routine."
            ),
            "orders": [
                "Lipid panel",
                "CMP",
                "Colon cancer screening order",
            ],
        },
    ],
    "schedule": [
        {
            "time": "09:00",
            "patient_id": "p-1001",
            "visit_type": "Diabetes follow-up",
            "status": "Ready",
        },
        {
            "time": "10:15",
            "patient_id": "p-1002",
            "visit_type": "Annual wellness",
            "status": "Arriving soon",
        },
    ],
    "tasks": [
        {
            "patient_id": "p-1001",
            "title": "Perform diabetic foot exam",
            "due": "Today",
            "status": "New",
        },
        {
            "patient_id": "p-1001",
            "title": "Send 90-day refill to pharmacy",
            "due": "Today",
            "status": "In Progress",
        },
        {
            "patient_id": "p-1002",
            "title": "Order colon cancer screening",
            "due": "Today",
            "status": "New",
        },
    ],
    "inbox": [
        {
            "patient_id": "p-1001",
            "title": "Refill request",
            "detail": "Patient asked for 90-day refill on diabetes medications.",
        },
        {
            "patient_id": "p-1001",
            "title": "A1c above goal",
            "detail": "Most recent A1c is 8.1%, up from 7.6%.",
        },
        {
            "patient_id": "p-1002",
            "title": "Screening gap reminder",
            "detail": "Colon screening remains overdue.",
        },
    ],
}


def load_data() -> dict:
    return deepcopy(APP_DATA)
