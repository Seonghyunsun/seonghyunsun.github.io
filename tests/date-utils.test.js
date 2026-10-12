import test from "node:test";
import assert from "node:assert/strict";
import { buildCalendar, diffParts, formatKoreanDate } from "../js/date-utils.js";

test("buildCalendar: 2027-01 starts on Friday and 3rd is a Sunday", () => {
  const w = buildCalendar(2027, 0);
  assert.deepEqual(w[0], [null, null, null, null, null, 1, 2]);
  assert.equal(w[1][0], 3);
});

test("diffParts: two days before", () => {
  const r = diffParts(new Date("2027-01-03T12:40:00+09:00"), new Date("2027-01-01T12:40:00+09:00"));
  assert.deepEqual(r, { days: 2, hours: 0, minutes: 0, seconds: 0, past: false });
});

test("diffParts: after target is past with zeros", () => {
  const r = diffParts(new Date("2027-01-03T12:40:00+09:00"), new Date("2027-01-04T00:00:00+09:00"));
  assert.deepEqual(r, { days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
});

test("formatKoreanDate: wedding date", () => {
  assert.equal(formatKoreanDate(new Date("2027-01-03T12:40:00+09:00")), "2027년 1월 3일 일요일 오후 12시 40분");
});

import { seoulYMD } from "../js/date-utils.js";
test("seoulYMD: KST date regardless of runtime timezone", () => {
  assert.deepEqual(seoulYMD(new Date("2027-01-03T00:10:00+09:00")), { year: 2027, month: 0, day: 3 });
});
