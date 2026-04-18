import { aiGovernance, authCases, codingQueue, inbox, messages, patientApp, patients, roles, schedule, tasks } from "./mock-data.mjs";

export const DEFAULT_ROUTE = { section: "app", screen: "home", patientId: null, panel: null };

export function createInitialState() {
  return {
    route: { ...DEFAULT_ROUTE },
    user: {
      name: "Dr. Sofia Bennett",
      org: "SoloCare Family Clinic",
      role: "physician"
    },
    patients,
    schedule,
    tasks,
    inbox,
    messages,
    authCases,
    codingQueue,
    patientApp,
    aiGovernance,
    roles,
    ui: {
      rightRailMode: "ai",
      selectedInboxId: inbox[0]?.id ?? null,
      selectedTaskId: tasks[0]?.id ?? null,
      selectedEventId: patients[0]?.timeline[0]?.id ?? null,
      selectedAuthId: authCases[0]?.id ?? null,
      selectedMessageId: messages[0]?.id ?? null,
      selectedCodingEncounterId: codingQueue[0]?.encounterId ?? null,
      selectedPatientAppTab: "home"
    },
    visitDrafts: {
      "enc-1": {
        encounterId: "enc-1",
        patientId: "p-1001",
        note:
          "Assessment: Type 2 diabetes remains above goal, but patient is adherent and motivated. Blood pressure is improving. No hypoglycemia reported.\n\nPlan:\n- Continue metformin and glipizide for now.\n- Review diet and home glucose log.\n- Perform diabetic foot exam today.\n- Send 90-day refills after medication reconciliation.",
        patientInstructions:
          "Take your medications with meals as directed, keep checking your blood sugar at home, and bring your glucose and blood pressure readings to the next visit.",
        acceptedSuggestionIds: [],
        dismissedSuggestionIds: [],
        pendingOrders: ["Hemoglobin A1c", "Diabetic foot exam", "90-day medication refill"],
        dirty: false,
        saveStatus: "saved"
      }
    },
    suggestions: {
      "enc-1": [
        {
          id: "s-2",
          title: "Document medication management clearly",
          kind: "documentation",
          confidence: 0.82,
          status: "ready",
          text: "Include chronic disease review, medication refill decision, and home glucose follow-up in the assessment and plan.",
          evidence: ["A1c above goal", "Medication refill requested", "Home glucose log reviewed"]
        }
      ]
    }
  };
}

export function createStore(initialState = createInitialState()) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case "NAVIGATE":
      return {
        ...state,
        route: {
          section: action.section ?? state.route.section,
          screen: action.screen ?? state.route.screen,
          patientId: action.patientId ?? null,
          panel: action.panel ?? null
        }
      };
    case "SET_ROLE":
      return {
        ...state,
        user: { ...state.user, role: action.role }
      };
    case "SELECT_PATIENT_TAB":
      return {
        ...state,
        route: { ...state.route, section: "app", screen: action.screen, patientId: action.patientId }
      };
    case "SELECT_INBOX_ITEM":
      return {
        ...state,
        ui: { ...state.ui, selectedInboxId: action.id }
      };
    case "SELECT_TASK":
      return {
        ...state,
        ui: { ...state.ui, selectedTaskId: action.id }
      };
    case "SELECT_EVENT":
      return {
        ...state,
        ui: { ...state.ui, selectedEventId: action.id }
      };
    case "SELECT_MESSAGE":
      return {
        ...state,
        ui: { ...state.ui, selectedMessageId: action.id }
      };
    case "SELECT_AUTH":
      return {
        ...state,
        ui: { ...state.ui, selectedAuthId: action.id }
      };
    case "SELECT_CODING":
      return {
        ...state,
        ui: { ...state.ui, selectedCodingEncounterId: action.id }
      };
    case "SET_PATIENT_APP_TAB":
      return {
        ...state,
        ui: { ...state.ui, selectedPatientAppTab: action.tab }
      };
    case "TOGGLE_TASK_COMPLETE":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, completed: !task.completed, lane: task.completed ? "new" : "complete" } : task
        )
      };
    case "UPDATE_VISIT_NOTE":
      return updateVisitDraft(state, action.encounterId, {
        note: action.value,
        dirty: true,
        saveStatus: "saving"
      });
    case "UPDATE_PATIENT_INSTRUCTIONS":
      return updateVisitDraft(state, action.encounterId, {
        patientInstructions: action.value,
        dirty: true,
        saveStatus: "saving"
      });
    case "SAVE_VISIT_DRAFT":
      return updateVisitDraft(state, action.encounterId, {
        dirty: false,
        saveStatus: "saved"
      });
    case "ACCEPT_SUGGESTION":
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          [action.encounterId]: (state.suggestions[action.encounterId] ?? []).map((suggestion) =>
            suggestion.id === action.id ? { ...suggestion, status: "accepted" } : suggestion
          )
        },
        visitDrafts: {
          ...state.visitDrafts,
          [action.encounterId]: {
            ...state.visitDrafts[action.encounterId],
            acceptedSuggestionIds: appendUnique(state.visitDrafts[action.encounterId]?.acceptedSuggestionIds ?? [], action.id)
          }
        }
      };
    case "DISMISS_SUGGESTION":
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          [action.encounterId]: (state.suggestions[action.encounterId] ?? []).map((suggestion) =>
            suggestion.id === action.id ? { ...suggestion, status: "dismissed" } : suggestion
          )
        }
      };
    default:
      return state;
  }
}

function updateVisitDraft(state, encounterId, patch) {
  const current = state.visitDrafts[encounterId] ?? {
    encounterId,
    note: "",
    patientInstructions: "",
    acceptedSuggestionIds: [],
    dismissedSuggestionIds: [],
    pendingOrders: [],
    dirty: false,
    saveStatus: "idle"
  };

  return {
    ...state,
    visitDrafts: {
      ...state.visitDrafts,
      [encounterId]: {
        ...current,
        ...patch
      }
    }
  };
}

function appendUnique(items, item) {
  return items.includes(item) ? items : [...items, item];
}

export function getCurrentPatient(state) {
  const patientId = state.route.patientId ?? state.patients[0]?.id;
  return state.patients.find((patient) => patient.id === patientId) ?? null;
}

export function getSelectedInboxItem(state) {
  return state.inbox.find((item) => item.id === state.ui.selectedInboxId) ?? null;
}

export function getSelectedTask(state) {
  return state.tasks.find((task) => task.id === state.ui.selectedTaskId) ?? null;
}

export function getSelectedEvent(state, patient = getCurrentPatient(state)) {
  return patient?.timeline.find((event) => event.id === state.ui.selectedEventId) ?? null;
}

export function getSelectedMessage(state) {
  return state.messages.find((message) => message.id === state.ui.selectedMessageId) ?? null;
}

export function getSelectedAuth(state) {
  return state.authCases.find((auth) => auth.id === state.ui.selectedAuthId) ?? null;
}

export function getSelectedCodingCase(state) {
  return state.codingQueue.find((entry) => entry.encounterId === state.ui.selectedCodingEncounterId) ?? null;
}

export function getActiveEncounterId(state) {
  return state.route.panel ?? "enc-1";
}
