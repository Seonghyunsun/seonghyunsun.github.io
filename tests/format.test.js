import test from "node:test";
import assert from "node:assert/strict";
import { parentsLine } from "../js/format.js";

test("both parents", () => {
  assert.equal(parentsLine({ father: "성락준", mother: "조미숙" }, "딸", "성현선"), "성락준 · 조미숙의 딸");
});
test("mother only", () => {
  assert.equal(parentsLine({ father: "", mother: "이경아" }, "아들", "김민혁"), "이경아의 아들");
});
test("father only", () => {
  assert.equal(parentsLine({ father: "성락준", mother: "" }, "딸", "성현선"), "성락준의 딸");
});
