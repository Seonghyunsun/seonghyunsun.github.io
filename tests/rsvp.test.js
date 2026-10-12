import test from "node:test";
import assert from "node:assert/strict";
import { validateRsvp } from "../js/rsvp.js";

const base = { name: "홍길동", attend: "yes", count: 2, meal: "yes", message: "" };

test("rejects whitespace-only name", () => {
  assert.equal(validateRsvp({ ...base, name: "  " }).ok, false);
});
test("rejects missing attendance choice", () => {
  assert.equal(validateRsvp({ ...base, attend: "" }).ok, false);
});
test("accepts valid attending response", () => {
  assert.deepEqual(validateRsvp(base), { ok: true });
});
test("does not check count when not attending", () => {
  assert.equal(validateRsvp({ ...base, attend: "no", count: 0 }).ok, true);
});
test("rejects count below 1 when attending", () => {
  assert.equal(validateRsvp({ ...base, count: 0 }).ok, false);
});
