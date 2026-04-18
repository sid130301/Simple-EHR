export const roles = [
  { id: "physician", label: "Physician", note: "Solo doctor view for day-to-day clinic work." }
];

export const patients = [
  {
    id: "p-1001",
    name: "Mary Carter",
    age: 67,
    sex: "F",
    dob: "1958-02-14",
    mrn: "SC-1001",
    pronouns: "she/her",
    insurance: "Medicare",
    pcp: "Dr. Sofia Bennett",
    riskLevel: "Moderate",
    flags: ["Diabetes", "HTN", "Due for foot exam"],
    allergies: ["Penicillin"],
    location: "Room 1",
    reasonForVisit: "Diabetes follow-up",
    whatMattersNow:
      "Home sugars are running higher this month, blood pressure is improving, and she wants a simple medication plan she can follow consistently.",
    memory:
      "Lives alone, keeps a paper medication list in her purse, prefers plain-language instructions, and usually does best when plans are limited to 2 or 3 concrete steps.",
    recentChanges: [
      "Fasting glucose increased during the last 3 weeks.",
      "No recent hypoglycemia.",
      "Walking 20 minutes most mornings."
    ],
    metrics: {
      a1c: "8.1%",
      bp: "138/84",
      egfr: "68",
      openLoops: 2
    },
    activeProblems: [
      "Type 2 diabetes mellitus",
      "Essential hypertension",
      "Hyperlipidemia"
    ],
    careGoals: [
      "Bring A1c below 7.5 within 3 months",
      "Keep home BP under 140/90",
      "Complete annual diabetic foot exam"
    ],
    meds: [
      { name: "Metformin ER 500 mg BID", adherence: "Good", issue: "Mild nausea if taken without food" },
      { name: "Glipizide 5 mg daily", adherence: "Good", issue: "Review for dose increase if sugars stay high" },
      { name: "Lisinopril 20 mg daily", adherence: "Good", issue: "BP improving" },
      { name: "Atorvastatin 20 mg nightly", adherence: "Good", issue: "No side effects reported" }
    ],
    labs: [
      { name: "Hemoglobin A1c", value: "8.1%", trend: "Up from 7.6%", significance: "Review today" },
      { name: "Creatinine", value: "0.9 mg/dL", trend: "Stable", significance: "Normal" },
      { name: "LDL", value: "86 mg/dL", trend: "Improved", significance: "At goal" }
    ],
    tasks: ["t-1", "t-2"],
    messages: ["m-1"],
    timeline: [
      {
        id: "ev-1",
        type: "visit",
        title: "Primary care follow-up",
        date: "2026-04-18",
        significance: "High",
        detail: "Reviewed diabetes control, diet habits, and home blood pressure log."
      },
      {
        id: "ev-2",
        type: "lab",
        title: "A1c resulted at 8.1%",
        date: "2026-04-11",
        significance: "High",
        detail: "A1c increased despite mostly stable home routine."
      },
      {
        id: "ev-3",
        type: "message",
        title: "Medication refill request",
        date: "2026-04-05",
        significance: "Medium",
        detail: "Requested 90-day refill to reduce pharmacy trips."
      }
    ],
    aiBrief: {
      summary:
        "Focus on medication adherence, diet review, foot exam, and whether glipizide needs a small adjustment.",
      agenda: [
        "Review home glucose readings",
        "Confirm medication adherence",
        "Perform diabetic foot exam"
      ],
      watchouts: [
        "Avoid over-complicating the plan",
        "Reinforce meals with glipizide use"
      ]
    },
    evidence: [
      "A1c rose from 7.6% to 8.1%.",
      "Blood pressure log is better than last visit.",
      "No reported hypoglycemia."
    ],
    billing: {
      lastClaim: "99214 paid on 2026-03-09",
      balance: "$25 copay due",
      status: "Collect at checkout"
    }
  },
  {
    id: "p-1002",
    name: "Daniel Lopez",
    age: 51,
    sex: "M",
    dob: "1975-09-03",
    mrn: "SC-1002",
    pronouns: "he/him",
    insurance: "Blue Cross PPO",
    pcp: "Dr. Sofia Bennett",
    riskLevel: "Low",
    flags: ["Annual physical", "Colon screening due"],
    allergies: ["None known"],
    location: "Room 2",
    reasonForVisit: "Annual wellness visit",
    whatMattersNow:
      "He feels generally well, wants to stay active, and mainly needs routine preventive care with a clean visit summary.",
    memory:
      "Prefers quick visits and digital follow-up. Usually completes labs promptly if ordered before noon.",
    recentChanges: [
      "Lost 6 pounds since last fall.",
      "Walking 4 days per week.",
      "No ER visits or new medications."
    ],
    metrics: {
      a1c: "5.8%",
      bp: "124/78",
      egfr: "95",
      openLoops: 1
    },
    activeProblems: [
      "Hyperlipidemia",
      "Preventive care maintenance"
    ],
    careGoals: [
      "Complete preventive screening",
      "Maintain exercise routine",
      "Review lab results in portal"
    ],
    meds: [
      { name: "Rosuvastatin 10 mg nightly", adherence: "Good", issue: "Well tolerated" }
    ],
    labs: [
      { name: "Lipid panel", value: "Pending", trend: "Ordered today", significance: "Preventive" },
      { name: "CMP", value: "Pending", trend: "Ordered today", significance: "Preventive" }
    ],
    tasks: ["t-3"],
    messages: ["m-2"],
    timeline: [
      {
        id: "ev-4",
        type: "visit",
        title: "Annual physical scheduled",
        date: "2026-04-18",
        significance: "Medium",
        detail: "Preventive visit with fasting labs and screening review."
      }
    ],
    aiBrief: {
      summary:
        "Straightforward preventive visit. Focus on screening, updated labs, and a concise after-visit plan.",
      agenda: [
        "Review screening gaps",
        "Order routine labs",
        "Discuss colon cancer screening"
      ],
      watchouts: [
        "Document counseling time clearly if extensive prevention counseling is done."
      ]
    },
    evidence: [
      "No acute complaints noted in pre-visit intake.",
      "Colon screening is overdue."
    ],
    billing: {
      lastClaim: "99396 paid on 2025-11-02",
      balance: "$0 due",
      status: "Clear"
    }
  }
];

export const schedule = [
  {
    id: "sch-1",
    patientId: "p-1001",
    time: "09:00",
    clinician: "Dr. Sofia Bennett",
    status: "Ready",
    visitType: "Diabetes follow-up",
    flags: ["Established patient", "Roomed"]
  },
  {
    id: "sch-2",
    patientId: "p-1002",
    time: "10:15",
    clinician: "Dr. Sofia Bennett",
    status: "Arriving soon",
    visitType: "Annual wellness",
    flags: ["Preventive"]
  }
];

export const tasks = [
  {
    id: "t-1",
    patientId: "p-1001",
    title: "Perform diabetic foot exam",
    owner: "Physician",
    due: "Today",
    lane: "new",
    risk: "warning",
    completed: false,
    detail: "Document sensation, pulses, skin check, and footwear guidance."
  },
  {
    id: "t-2",
    patientId: "p-1001",
    title: "Send 90-day refill to pharmacy",
    owner: "Physician",
    due: "Today",
    lane: "in-progress",
    risk: "info",
    completed: false,
    detail: "Patient prefers fewer pharmacy trips."
  },
  {
    id: "t-3",
    patientId: "p-1002",
    title: "Order colon cancer screening",
    owner: "Physician",
    due: "Today",
    lane: "new",
    risk: "info",
    completed: false,
    detail: "Discuss stool testing versus colonoscopy."
  }
];

export const inbox = [
  {
    id: "i-1",
    queue: "messages",
    patientId: "p-1001",
    title: "Refill request",
    urgency: "Medium",
    status: "Open",
    owner: "Physician",
    detail: "Patient asked for 90-day refill on diabetes medications.",
    recommendation: "Review glucose control today and send refill before checkout."
  },
  {
    id: "i-2",
    queue: "labs",
    patientId: "p-1001",
    title: "A1c above goal",
    urgency: "High",
    status: "Open",
    owner: "Physician",
    detail: "Most recent A1c is 8.1%, up from 7.6%.",
    recommendation: "Address adherence, diet, and whether medication adjustment is needed."
  },
  {
    id: "i-3",
    queue: "preventive",
    patientId: "p-1002",
    title: "Screening gap reminder",
    urgency: "Low",
    status: "Open",
    owner: "Physician",
    detail: "Colon screening remains overdue.",
    recommendation: "Close the gap during annual visit and document counseling."
  }
];

export const messages = [
  {
    id: "m-1",
    patientId: "p-1001",
    author: "Mary Carter",
    title: "Can I get a 90-day refill?",
    preview: "It would help me not make so many pharmacy trips.",
    thread: [
      { from: "Mary Carter", at: "08:02", text: "Can I get a 90-day refill? It would help me not make so many pharmacy trips." },
      { from: "Clinic", at: "08:20", text: "We will review your medications at today’s visit and send updates after the appointment." }
    ]
  },
  {
    id: "m-2",
    patientId: "p-1002",
    author: "Daniel Lopez",
    title: "Question about fasting labs",
    preview: "Should I still do the labs if I had coffee this morning?",
    thread: [
      { from: "Daniel Lopez", at: "07:42", text: "Should I still do the labs if I had coffee this morning?" }
    ]
  }
];

export const authCases = [
  {
    id: "a-1",
    patientId: "p-1001",
    title: "Medication prior authorization",
    payer: "Medicare Part D",
    status: "No active issues",
    due: "N/A",
    missingDocs: [
      "None"
    ],
    packetSummary:
      "This chart currently has no active prior authorization blockers."
  }
];

export const codingQueue = [
  {
    encounterId: "enc-1",
    patientId: "p-1001",
    title: "Diabetes follow-up visit",
    proposedCode: "99214",
    confidence: "0.82",
    warning: "Make sure medication management and chronic condition review are both clearly documented."
  }
];

export const patientApp = {
  nextAppointment: "Today at 09:00 with Dr. Sofia Bennett",
  carePlan: [
    "Take medications with food when directed.",
    "Bring blood pressure and glucose logs to follow-up.",
    "Complete ordered labs before next visit."
  ],
  tasks: [
    "Review medication list",
    "Complete labs",
    "Schedule follow-up if needed"
  ],
  questionnaires: [
    "Medication review",
    "Diabetes symptom check",
    "Preventive screening form"
  ]
};

export const aiGovernance = {
  policies: [
    "Clinical decisions require physician review.",
    "Orders are not placed automatically.",
    "Patient-facing instructions should stay plain language."
  ],
  incidents: [
    "No current issues."
  ],
  usage: {
    suggestionsAccepted: "65%",
    noteTimeSaved: "8 min / visit",
    openAuditFlags: 0
  }
};
