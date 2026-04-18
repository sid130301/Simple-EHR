import {
  getActiveEncounterId,
  getCurrentPatient,
  getSelectedInboxItem,
  getSelectedMessage,
  getSelectedTask
} from "./app-state.mjs";

const APP_SCREENS = [
  { id: "home", label: "Dashboard", meta: "Clinic overview" },
  { id: "schedule", label: "Schedule", meta: "Today’s visits" },
  { id: "inbox", label: "Inbox", meta: "Labs and messages" },
  { id: "tasks", label: "Tasks", meta: "Follow-up items" },
  { id: "billing", label: "Billing", meta: "Simple claims view" }
];

const PATIENT_SCREENS = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "History" },
  { id: "visit", label: "Visit Note" },
  { id: "results", label: "Labs" },
  { id: "orders", label: "Orders" },
  { id: "messages", label: "Messages" }
];

export function renderApp(container, state) {
  container.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        ${renderSidebar(state)}
      </aside>
      <main class="main-shell">
        ${renderTopbar(state)}
        <div class="content-stack">
          ${renderCurrentScreen(state)}
        </div>
      </main>
      <aside class="context-rail">
        ${renderRail(state)}
      </aside>
    </div>
  `;
}

function renderSidebar(state) {
  const currentPatient = getCurrentPatient(state);

  return `
    <div class="brand-block">
      <div class="brand-mark">SC</div>
      <p class="eyebrow">Solo Physician Clinic</p>
      <h1 class="brand-title">Simple EHR</h1>
    </div>

    <div class="nav-group">
      <p class="eyebrow">Main</p>
      <div class="nav-list">
        ${APP_SCREENS.map((screen) => `
          <button class="nav-button ${state.route.screen === screen.id && !state.route.patientId ? "active" : ""}"
            data-action="navigate" data-section="app" data-screen="${screen.id}">
            <span>${screen.label}</span>
            <span class="nav-meta">${screen.meta}</span>
          </button>
        `).join("")}
      </div>
    </div>

    <div class="nav-group">
      <p class="eyebrow">Patients</p>
      <div class="nav-list">
        ${state.patients.map((patient) => `
          <button class="nav-button ${state.route.patientId === patient.id ? "active" : ""}"
            data-action="open-patient" data-patient-id="${patient.id}" data-screen="overview">
            <span>${patient.name}</span>
            <span class="nav-meta">${patient.reasonForVisit}</span>
          </button>
        `).join("")}
      </div>
    </div>

    <div class="sidebar-card">
      <p class="eyebrow">Signed In</p>
      <h3>${state.user.name}</h3>
      <p>${state.user.org}</p>
      ${currentPatient ? `<p style="margin-top: 14px;">Open chart: <strong>${currentPatient.name}</strong></p>` : ""}
    </div>
  `;
}

function renderTopbar(state) {
  return `
    <div class="topbar">
      <div class="search-shell">
        <label class="sr-only" for="global-search">Search</label>
        <input id="global-search" value="" placeholder="Search patients, messages, labs, tasks..." readonly>
      </div>
      <div class="topbar-actions">
        <button class="ghost-button" data-action="navigate" data-section="app" data-screen="schedule">Today</button>
        <button class="secondary-button" data-action="open-patient" data-patient-id="p-1001" data-screen="visit" data-panel="enc-1">Open Note</button>
      </div>
    </div>
  `;
}

function renderCurrentScreen(state) {
  if (state.route.patientId) {
    return renderPatientScreen(state);
  }

  switch (state.route.screen) {
    case "schedule":
      return renderSchedule(state);
    case "inbox":
      return renderInbox(state);
    case "tasks":
      return renderTasks(state);
    case "billing":
      return renderBilling(state);
    case "home":
    default:
      return renderHome(state);
  }
}

function renderHome(state) {
  const todayReady = state.schedule.filter((entry) => entry.status === "Ready").length;
  const openTasks = state.tasks.filter((task) => !task.completed).length;
  const dueBalances = state.patients.filter((patient) => patient.billing.balance !== "$0 due").length;

  return `
    <section class="surface hero-surface">
      <p class="eyebrow">Daily Clinic Snapshot</p>
      <h2 class="hero-title">A simple chart, schedule, note, and billing workflow for one doctor.</h2>
      <p class="hero-copy">
        This lightweight EHR keeps the essentials in one place: today’s patients, chart review, visit notes, orders, messages, and basic billing status.
      </p>
      <div class="metric-grid">
        <div class="metric-card"><span>Patients Today</span><strong>${state.schedule.length}</strong></div>
        <div class="metric-card"><span>Ready Now</span><strong>${todayReady}</strong></div>
        <div class="metric-card"><span>Open Tasks</span><strong>${openTasks}</strong></div>
        <div class="metric-card"><span>Balances Due</span><strong>${dueBalances}</strong></div>
      </div>
    </section>

    <section class="tri-grid">
      <article class="surface">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Today</p>
            <h3 class="panel-title">What needs attention first</h3>
          </div>
        </div>
        <ul>
          <li>Mary Carter needs diabetes follow-up, medication refill review, and a diabetic foot exam.</li>
          <li>Daniel Lopez is a straightforward preventive visit with screening gaps to close.</li>
          <li>One patient has a copay balance that should be collected at checkout.</li>
        </ul>
      </article>
      <article class="surface">
        <p class="eyebrow">Quick Counts</p>
        <h3 class="panel-title">Small practice workflow</h3>
        <div class="kpi-strip">
          <div class="mini-stat"><span>Messages</span><strong>${state.messages.length}</strong></div>
          <div class="mini-stat"><span>Labs to review</span><strong>${state.inbox.filter((item) => item.queue === "labs").length}</strong></div>
          <div class="mini-stat"><span>Orders today</span><strong>${state.tasks.length}</strong></div>
        </div>
      </article>
      <article class="surface">
        <p class="eyebrow">Built For</p>
        <h3 class="panel-title">Solo clinic basics</h3>
        <ul>
          <li>Fast access to the day’s schedule.</li>
          <li>Chart review and note drafting in one place.</li>
          <li>Simple billing and balance tracking.</li>
        </ul>
      </article>
    </section>

    <section class="card-grid">
      ${state.patients.map((patient) => `
        <article class="module-card">
          <p class="eyebrow">${patient.reasonForVisit}</p>
          <h3>${patient.name}</h3>
          <p>${patient.whatMattersNow}</p>
          <div class="chip-row">
            ${patient.flags.map((flag) => `<span class="chip active-chip">${flag}</span>`).join("")}
          </div>
          <div class="action-row" style="margin-top: 14px;">
            <button class="secondary-button" data-action="open-patient" data-patient-id="${patient.id}" data-screen="overview">Open Chart</button>
            <button class="ghost-button" data-action="open-patient" data-patient-id="${patient.id}" data-screen="visit" data-panel="enc-1">Visit Note</button>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderSchedule(state) {
  return `
    <section class="surface">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Schedule</p>
          <h2 class="panel-title">Today’s appointments</h2>
        </div>
        <div class="chip-row">
          <span class="pill">Provider: ${state.user.name}</span>
          <span class="pill">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
      </div>
      <div class="card-grid" style="margin-top: 18px;">
        ${state.schedule.map((entry) => {
          const patient = state.patients.find((item) => item.id === entry.patientId);
          return `
            <article class="story-card">
              <div class="row-between">
                <div>
                  <p class="eyebrow">${entry.time} • ${entry.visitType}</p>
                  <h3>${patient.name}</h3>
                </div>
                <span class="status-badge ${entry.status === "Ready" ? "info" : "warning"}">${entry.status}</span>
              </div>
              <p>${patient.aiBrief.summary}</p>
              <div class="chip-row">
                ${entry.flags.map((flag) => `<span class="chip">${flag}</span>`).join("")}
              </div>
              <div class="action-row" style="margin-top: 14px;">
                <button class="secondary-button" data-action="open-patient" data-patient-id="${patient.id}" data-screen="overview">Chart</button>
                <button class="primary-button" data-action="open-patient" data-patient-id="${patient.id}" data-screen="visit" data-panel="enc-1">Start Visit</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderInbox(state) {
  const selected = getSelectedInboxItem(state) ?? state.inbox[0];
  const patient = selected ? state.patients.find((item) => item.id === selected.patientId) : null;

  return `
    <section class="surface">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Inbox</p>
          <h2 class="panel-title">Messages, labs, and reminders</h2>
        </div>
        <button class="secondary-button" data-action="navigate" data-section="app" data-screen="tasks">Open Tasks</button>
      </div>
      <div class="queue-layout" style="margin-top: 18px;">
        <div class="queue-stack">
          ${state.inbox.map((item) => `
            <button class="queue-item ${selected?.id === item.id ? "active" : ""}" data-action="select-inbox" data-id="${item.id}">
              <div class="row-between">
                <div>
                  <p class="eyebrow">${item.queue}</p>
                  <h3>${item.title}</h3>
                </div>
                <span class="status-badge ${item.urgency === "High" ? "alert" : item.urgency === "Medium" ? "warning" : "info"}">${item.urgency}</span>
              </div>
              <p>${item.detail}</p>
            </button>
          `).join("")}
        </div>
        <div class="detail-card">
          ${selected ? `
            <p class="eyebrow">Selected Item</p>
            <h3>${selected.title}</h3>
            <p>${selected.detail}</p>
            ${patient ? `<p><strong>Patient:</strong> ${patient.name} • ${patient.reasonForVisit}</p>` : ""}
            <div class="chip-row">
              <span class="chip active-chip">${selected.owner}</span>
              <span class="chip">${selected.status}</span>
            </div>
            <div class="divider"></div>
            <p class="eyebrow">Suggested next step</p>
            <p>${selected.recommendation}</p>
            <div class="action-row">
              <button class="secondary-button" data-action="open-patient" data-patient-id="${selected.patientId}" data-screen="overview">Open Chart</button>
              <button class="primary-button" data-action="open-patient" data-patient-id="${selected.patientId}" data-screen="messages">Open Messages</button>
            </div>
          ` : `<div class="empty-state">No inbox item selected.</div>`}
        </div>
        <div class="detail-card">
          <p class="eyebrow">Quick Tips</p>
          <h3>Keep the inbox short</h3>
          <ul>
            <li>Resolve messages during the visit when possible.</li>
            <li>Turn follow-up needs into tasks.</li>
            <li>Review abnormal labs before closing the chart.</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

function renderTasks(state) {
  const lanes = [
    { id: "new", label: "New" },
    { id: "in-progress", label: "In Progress" },
    { id: "complete", label: "Complete" }
  ];

  return `
    <section class="surface">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Tasks</p>
          <h2 class="panel-title">Clinic follow-up list</h2>
        </div>
        <button class="secondary-button" data-action="navigate" data-section="app" data-screen="inbox">Back to Inbox</button>
      </div>
      <div class="board-grid" style="margin-top: 18px;">
        ${lanes.map((lane) => `
          <div class="surface">
            <div class="section-header">
              <h3>${lane.label}</h3>
              <span class="chip">${state.tasks.filter((task) => task.lane === lane.id).length}</span>
            </div>
            <div class="task-stack" style="margin-top: 12px;">
              ${state.tasks.filter((task) => task.lane === lane.id).map((task) => `
                <article class="task-card ${task.completed ? "done" : ""}">
                  <p class="eyebrow">${patientName(state, task.patientId)} • ${task.owner}</p>
                  <h3>${task.title}</h3>
                  <p>${task.detail}</p>
                  <div class="chip-row">
                    <span class="task-tag ${task.risk}">${task.due}</span>
                  </div>
                  <div class="action-row" style="margin-top: 14px;">
                    <button class="ghost-button" data-action="toggle-task" data-id="${task.id}">
                      ${task.completed ? "Reopen" : "Complete"}
                    </button>
                    <button class="secondary-button" data-action="open-patient" data-patient-id="${task.patientId}" data-screen="overview">Chart</button>
                  </div>
                </article>
              `).join("") || `<div class="empty-state">No items in this lane.</div>`}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderBilling(state) {
  return `
    <section class="surface">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Billing</p>
          <h2 class="panel-title">Simple claims and balances</h2>
        </div>
      </div>
      <div class="card-grid" style="margin-top: 18px;">
        ${state.patients.map((patient) => `
          <article class="detail-card">
            <p class="eyebrow">${patient.reasonForVisit}</p>
            <h3>${patient.name}</h3>
            <p><strong>Last claim:</strong> ${patient.billing.lastClaim}</p>
            <p><strong>Balance:</strong> ${patient.billing.balance}</p>
            <div class="chip-row">
              <span class="chip active-chip">${patient.billing.status}</span>
            </div>
            <div class="action-row" style="margin-top: 14px;">
              <button class="secondary-button" data-action="open-patient" data-patient-id="${patient.id}" data-screen="overview">Open Chart</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPatientScreen(state) {
  const patient = getCurrentPatient(state);
  if (!patient) {
    return `<section class="surface empty-state">No patient selected.</section>`;
  }

  const currentScreen = state.route.screen;

  return `
    <section class="patient-header">
      <div class="patient-banner">
        <p class="eyebrow">${patient.reasonForVisit}</p>
        <h1>${patient.name}</h1>
        <div class="chip-row">
          <span class="chip active-chip">${patient.age} • ${patient.sex}</span>
          <span class="chip">DOB ${patient.dob}</span>
          <span class="chip">MRN ${patient.mrn}</span>
          <span class="chip">${patient.insurance}</span>
        </div>
        <p>${patient.whatMattersNow}</p>
      </div>
      <div class="patient-subnav">
        ${PATIENT_SCREENS.map((screen) => `
          <button class="subnav-button ${currentScreen === screen.id ? "active" : ""}" data-action="patient-tab" data-patient-id="${patient.id}" data-screen="${screen.id}">
            ${screen.label}
          </button>
        `).join("")}
      </div>
    </section>
    ${renderPatientContent(state, patient)}
  `;
}

function renderPatientContent(state, patient) {
  switch (state.route.screen) {
    case "timeline":
      return renderTimeline(patient);
    case "visit":
      return renderVisit(state, patient);
    case "orders":
      return renderOrders(state, patient);
    case "results":
      return renderResults(patient);
    case "messages":
      return renderMessages(state, patient);
    case "overview":
    default:
      return renderOverview(patient);
  }
}

function renderOverview(patient) {
  return `
    <section class="patient-grid">
      <article class="surface">
        <p class="eyebrow">Summary</p>
        <h3 class="panel-title">What matters now</h3>
        <p>${patient.memory}</p>
        <div class="divider"></div>
        <p class="eyebrow">Recent changes</p>
        <ul>${patient.recentChanges.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="surface">
        <p class="eyebrow">Problem List</p>
        <h3 class="panel-title">Active problems</h3>
        <ul>${patient.activeProblems.map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="divider"></div>
        <p class="eyebrow">Allergies</p>
        <ul>${patient.allergies.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="surface">
        <p class="eyebrow">Meds And Vitals</p>
        <h3 class="panel-title">Snapshot</h3>
        <div class="kpi-strip">
          <div class="mini-stat"><span>A1c</span><strong>${patient.metrics.a1c}</strong></div>
          <div class="mini-stat"><span>BP</span><strong>${patient.metrics.bp}</strong></div>
          <div class="mini-stat"><span>eGFR</span><strong>${patient.metrics.egfr}</strong></div>
          <div class="mini-stat"><span>Open loops</span><strong>${patient.metrics.openLoops}</strong></div>
        </div>
        <div class="divider"></div>
        <p class="eyebrow">Current meds</p>
        <ul>${patient.meds.map((med) => `<li><strong>${med.name}</strong> • ${med.issue}</li>`).join("")}</ul>
      </article>
    </section>
  `;
}

function renderTimeline(patient) {
  return `
    <section class="summary-grid">
      <article class="surface">
        <p class="eyebrow">Chart history</p>
        <h3 class="panel-title">Recent timeline</h3>
        <div class="timeline-stack">
          ${patient.timeline.map((event) => `
            <article class="timeline-event active">
              <p class="eyebrow">${event.date} • ${event.type}</p>
              <h3>${event.title}</h3>
              <p>${event.detail}</p>
            </article>
          `).join("")}
        </div>
      </article>
      <article class="surface">
        <p class="eyebrow">Care goals</p>
        <h3 class="panel-title">Next steps</h3>
        <ul>${patient.careGoals.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    </section>
  `;
}

function renderVisit(state, patient) {
  const encounterId = getActiveEncounterId(state);
  const draft = state.visitDrafts[encounterId];

  return `
    <section class="visit-layout">
      <div class="surface">
        <p class="eyebrow">Pre-Visit</p>
        <h3 class="panel-title">Agenda</h3>
        <p>${patient.aiBrief.summary}</p>
        <div class="divider"></div>
        <p class="eyebrow">Suggested checklist</p>
        <ul>${patient.aiBrief.agenda.map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="divider"></div>
        <p class="eyebrow">Watchouts</p>
        <ul>${patient.aiBrief.watchouts.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div class="surface">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Visit Note</p>
            <h3 class="panel-title">Assessment and plan</h3>
          </div>
          <span class="status-badge ${draft?.dirty ? "warning" : "info"}">${draft?.saveStatus ?? "idle"}</span>
        </div>
        <div class="input-grid" style="margin-top: 18px;">
          <div class="field">
            <label for="visit-note">Physician note</label>
            <textarea id="visit-note" class="visit-notes" data-action="update-visit-note" data-encounter-id="${encounterId}">${draft?.note ?? ""}</textarea>
          </div>
          <div class="field">
            <label for="patient-plan">After-visit instructions</label>
            <textarea id="patient-plan" data-action="update-instructions" data-encounter-id="${encounterId}">${draft?.patientInstructions ?? ""}</textarea>
          </div>
        </div>
        <div class="action-row" style="margin-top: 14px;">
          <button class="secondary-button" data-action="save-draft" data-encounter-id="${encounterId}">Save Note</button>
          <button class="primary-button" data-action="patient-tab" data-patient-id="${patient.id}" data-screen="orders">Review Orders</button>
        </div>
      </div>
      <div class="surface">
        <p class="eyebrow">Quick Reminder</p>
        <h3 class="panel-title">Document clearly</h3>
        <ul>
          <li>List chronic conditions addressed today.</li>
          <li>Document any medication changes and monitoring.</li>
          <li>Keep patient instructions short and specific.</li>
        </ul>
      </div>
    </section>
  `;
}

function renderOrders(state, patient) {
  const draft = state.visitDrafts[getActiveEncounterId(state)];

  return `
    <section class="summary-grid">
      <article class="surface">
        <p class="eyebrow">Orders</p>
        <h3 class="panel-title">Planned items</h3>
        <ul>${(draft?.pendingOrders ?? []).map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="divider"></div>
        <p class="eyebrow">Common actions</p>
        <div class="chip-row">
          <span class="chip active-chip">CBC</span>
          <span class="chip">CMP</span>
          <span class="chip">Lipid panel</span>
          <span class="chip">A1c</span>
        </div>
      </article>
      <article class="surface">
        <p class="eyebrow">Follow-up</p>
        <h3 class="panel-title">Patient-specific notes</h3>
        <ul>
          <li>Confirm preferred pharmacy before sending refills.</li>
          <li>Use the visit summary as the checkout handoff.</li>
          <li>Schedule follow-up before closing today’s chart.</li>
        </ul>
        <div class="action-row">
          <button class="secondary-button" data-action="navigate" data-section="app" data-screen="billing">Open Billing</button>
        </div>
      </article>
    </section>
  `;
}

function renderResults(patient) {
  return `
    <section class="summary-grid">
      <article class="surface">
        <p class="eyebrow">Labs</p>
        <h3 class="panel-title">Recent results</h3>
        <div class="queue-stack">
          ${patient.labs.map((lab) => `
            <article class="queue-item">
              <div class="row-between">
                <div>
                  <p class="eyebrow">${lab.significance}</p>
                  <h3>${lab.name}</h3>
                </div>
                <span class="chip active-chip">${lab.value}</span>
              </div>
              <p>${lab.trend}</p>
            </article>
          `).join("")}
        </div>
      </article>
      <article class="surface">
        <p class="eyebrow">Review</p>
        <h3 class="panel-title">What to address</h3>
        <ul>
          <li>Review abnormal or above-goal values during the visit.</li>
          <li>Connect results to medication and follow-up decisions.</li>
          <li>Include the plan in the after-visit summary.</li>
        </ul>
      </article>
    </section>
  `;
}

function renderMessages(state, patient) {
  const selected = getSelectedMessage(state) ?? state.messages.find((message) => message.patientId === patient.id);

  return `
    <section class="queue-layout">
      <div class="queue-stack">
        ${state.messages.filter((message) => message.patientId === patient.id).map((message) => `
          <button class="queue-item ${selected?.id === message.id ? "active" : ""}" data-action="select-message" data-id="${message.id}">
            <p class="eyebrow">${message.author}</p>
            <h3>${message.title}</h3>
            <p>${message.preview}</p>
          </button>
        `).join("")}
      </div>
      <div class="detail-card">
        ${selected ? `
          <p class="eyebrow">Conversation</p>
          <h3>${selected.title}</h3>
          <div class="timeline-stack">
            ${selected.thread.map((item) => `
              <article class="detail-card">
                <p class="eyebrow">${item.from} • ${item.at}</p>
                <p>${item.text}</p>
              </article>
            `).join("")}
          </div>
        ` : `<div class="empty-state">No message selected.</div>`}
      </div>
      <div class="detail-card">
        <p class="eyebrow">Reply Suggestion</p>
        <h3>Simple response</h3>
        <p>Thank you for the message. We reviewed your chart and will include the answer in today’s plan or send an update after the visit.</p>
      </div>
    </section>
  `;
}

function renderRail(state) {
  const patient = getCurrentPatient(state);
  const task = getSelectedTask(state);

  return `
    <article class="rail-card">
      <p class="eyebrow">Current Context</p>
      <h2 class="rail-title">${patient ? patient.name : "Clinic overview"}</h2>
      <p>${patient ? patient.whatMattersNow : "Select a patient to view chart details."}</p>
    </article>
    <article class="rail-card">
      <p class="eyebrow">Key Facts</p>
      <ul>${(patient?.evidence ?? ["Today’s schedule and tasks are visible from the dashboard."]).map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article class="rail-card">
      <p class="eyebrow">Focused Task</p>
      ${task ? `
        <h3>${task.title}</h3>
        <p>${task.detail}</p>
      ` : `<p>No task selected.</p>`}
    </article>
  `;
}

function patientName(state, patientId) {
  return state.patients.find((patient) => patient.id === patientId)?.name ?? "Unknown";
}
