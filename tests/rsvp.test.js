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

import { normalizeRsvp } from "../js/rsvp.js";
import { readFileSync } from "node:fs";
import vm from "node:vm";

test("rejects count above 10 when attending", () => {
  assert.equal(validateRsvp({ ...base, count: 999 }).ok, false);
});
test("normalizeRsvp drops meal and count when not attending", () => {
  assert.deepEqual(normalizeRsvp({ ...base, attend: "no", meal: "yes", count: 3 }),
    { ...base, attend: "no", meal: "", count: 0 });
});
test("Code.gs safeCell neutralises formula-leading text", () => {
  const ctx = {};
  vm.runInNewContext(readFileSync(new URL("../apps-script/Code.gs", import.meta.url), "utf8"), ctx);
  assert.equal(ctx.safeCell("=IMAGE(1)"), "'=IMAGE(1)");
  assert.equal(ctx.safeCell("+1"), "'+1");
  assert.equal(ctx.safeCell("-축하"), "'-축하");
  assert.equal(ctx.safeCell("@a"), "'@a");
  assert.equal(ctx.safeCell("축하해요"), "축하해요");
  assert.equal(ctx.safeCell("x".repeat(600)).length, 500);
});
