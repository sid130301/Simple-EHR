import { createStore } from "./app-state.mjs";
import { renderApp } from "./app-render.mjs";

const appRoot = document.querySelector("#app");
const store = createStore();

render();
store.subscribe(render);

appRoot.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) {
    return;
  }

  const action = actionTarget.dataset.action;

  switch (action) {
    case "navigate":
      store.dispatch({
        type: "NAVIGATE",
        section: actionTarget.dataset.section,
        screen: actionTarget.dataset.screen,
        patientId: actionTarget.dataset.patientId ?? null,
        panel: actionTarget.dataset.panel ?? null
      });
      break;
    case "open-patient":
      store.dispatch({
        type: "NAVIGATE",
        section: "app",
        screen: actionTarget.dataset.screen,
        patientId: actionTarget.dataset.patientId,
        panel: actionTarget.dataset.panel ?? null
      });
      break;
    case "patient-tab":
      store.dispatch({
        type: "SELECT_PATIENT_TAB",
        patientId: actionTarget.dataset.patientId,
        screen: actionTarget.dataset.screen
      });
      break;
    case "select-inbox":
      store.dispatch({ type: "SELECT_INBOX_ITEM", id: actionTarget.dataset.id });
      break;
    case "select-event":
      store.dispatch({ type: "SELECT_EVENT", id: actionTarget.dataset.id });
      break;
    case "select-message":
      store.dispatch({ type: "SELECT_MESSAGE", id: actionTarget.dataset.id });
      break;
    case "select-auth":
      store.dispatch({ type: "SELECT_AUTH", id: actionTarget.dataset.id });
      break;
    case "select-task":
      store.dispatch({ type: "SELECT_TASK", id: actionTarget.dataset.id });
      break;
    case "toggle-task":
      store.dispatch({ type: "TOGGLE_TASK_COMPLETE", id: actionTarget.dataset.id });
      break;
    case "save-draft":
      store.dispatch({ type: "SAVE_VISIT_DRAFT", encounterId: actionTarget.dataset.encounterId });
      break;
    case "accept-suggestion":
      store.dispatch({
        type: "ACCEPT_SUGGESTION",
        encounterId: actionTarget.dataset.encounterId,
        id: actionTarget.dataset.id
      });
      break;
    case "dismiss-suggestion":
      store.dispatch({
        type: "DISMISS_SUGGESTION",
        encounterId: actionTarget.dataset.encounterId,
        id: actionTarget.dataset.id
      });
      break;
    case "set-role":
      store.dispatch({ type: "SET_ROLE", role: actionTarget.dataset.role });
      break;
    case "patient-app-tab":
      store.dispatch({ type: "SET_PATIENT_APP_TAB", tab: actionTarget.dataset.tab });
      break;
    default:
      break;
  }
});

appRoot.addEventListener("input", (event) => {
  const target = event.target;

  if (target.matches("[data-action='update-visit-note']")) {
    store.dispatch({
      type: "UPDATE_VISIT_NOTE",
      encounterId: target.dataset.encounterId,
      value: target.value
    });
  }

  if (target.matches("[data-action='update-instructions']")) {
    store.dispatch({
      type: "UPDATE_PATIENT_INSTRUCTIONS",
      encounterId: target.dataset.encounterId,
      value: target.value
    });
  }
});

function render() {
  renderApp(appRoot, store.getState());
}

registerServiceWorker();

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.error("Service worker registration failed", error);
    }
  });
}
