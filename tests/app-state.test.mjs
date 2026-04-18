import assert from "node:assert/strict";

import { createInitialState, getCurrentPatient, reducer } from "../src/app-state.mjs";

const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

test("navigates into a patient chart screen", () => {
  const state = createInitialState();
  const next = reducer(state, {
    type: "NAVIGATE",
    section: "app",
    screen: "overview",
    patientId: "p-1002"
  });

  assert.equal(next.route.patientId, "p-1002");
  assert.equal(next.route.screen, "overview");
  assert.equal(getCurrentPatient(next)?.name, "Daniel Lopez");
});

test("toggles task completion and moves it into complete lane", () => {
  const state = createInitialState();
  const next = reducer(state, { type: "TOGGLE_TASK_COMPLETE", id: "t-2" });
  const task = next.tasks.find((entry) => entry.id === "t-2");

  assert.equal(task?.completed, true);
  assert.equal(task?.lane, "complete");
});

test("updates visit note and marks draft as saving", () => {
  const state = createInitialState();
  const next = reducer(state, {
    type: "UPDATE_VISIT_NOTE",
    encounterId: "enc-1",
    value: "Updated note content"
  });

  assert.equal(next.visitDrafts["enc-1"].note, "Updated note content");
  assert.equal(next.visitDrafts["enc-1"].dirty, true);
  assert.equal(next.visitDrafts["enc-1"].saveStatus, "saving");
});

test("accepts an AI suggestion and records it on the draft", () => {
  const state = createInitialState();
  const next = reducer(state, {
    type: "ACCEPT_SUGGESTION",
    encounterId: "enc-1",
    id: "s-2"
  });

  const suggestion = next.suggestions["enc-1"].find((entry) => entry.id === "s-2");

  assert.equal(suggestion?.status, "accepted");
  assert.equal(next.visitDrafts["enc-1"].acceptedSuggestionIds.includes("s-2"), true);
});

let failures = 0;

for (const entry of tests) {
  try {
    entry.run();
    console.log(`PASS ${entry.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${entry.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`Passed ${tests.length} tests.`);
}
