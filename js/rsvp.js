export function validateRsvp(d) {
  if (!d.name || !d.name.trim()) return { ok: false, error: "성함을 입력해 주세요." };
  if (d.attend !== "yes" && d.attend !== "no") return { ok: false, error: "참석 여부를 선택해 주세요." };
  if (d.attend === "yes" && !(Number(d.count) >= 1)) return { ok: false, error: "참석 인원을 입력해 주세요." };
  return { ok: true };
}

export function initRsvp(root, url) {
  root.innerHTML = `
    <h2>Information<small>공지사항</small></h2>
    <p>참석 여부를 미리 알려 주시면<br>예식 준비에 큰 도움이 됩니다.</p>
    <p><button class="btn solid" id="rsvp-open">참석 여부 전달하기</button></p>
    <div class="modal" id="rsvp-modal" hidden>
      <form class="modal-card" id="rsvp-form" novalidate>
        <h3>참석 여부 전달</h3>
        <label>성함<input name="name" autocomplete="name" required></label>
        <fieldset><legend>참석 여부</legend>
          <label class="inline"><input type="radio" name="attend" value="yes"> 참석</label>
          <label class="inline"><input type="radio" name="attend" value="no"> 불참</label>
        </fieldset>
        <div id="attend-only">
          <label>참석 인원(본인 포함)<input name="count" type="number" min="1" max="10" value="1"></label>
          <fieldset><legend>식사 여부</legend>
            <label class="inline"><input type="radio" name="meal" value="yes"> 식사함</label>
            <label class="inline"><input type="radio" name="meal" value="no"> 식사 안 함</label>
          </fieldset>
        </div>
        <label>전하실 말씀<textarea name="message" rows="3"></textarea></label>
        <p class="form-msg" id="rsvp-msg" role="alert"></p>
        <div class="modal-actions">
          <button type="button" class="btn" id="rsvp-cancel">닫기</button>
          <button type="submit" class="btn solid" id="rsvp-submit">전달하기</button>
        </div>
      </form>
    </div>`;
  const modal = root.querySelector("#rsvp-modal"), form = root.querySelector("#rsvp-form");
  const msg = root.querySelector("#rsvp-msg"), submit = root.querySelector("#rsvp-submit");
  const open = () => { modal.hidden = false; };
  const close = () => { modal.hidden = true; };
  root.querySelector("#rsvp-open").onclick = open;
  root.querySelector("#rsvp-cancel").onclick = close;
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  form.addEventListener("change", () => {
    root.querySelector("#attend-only").hidden = form.attend.value === "no";
  });
  if (!url) {
    submit.disabled = true;
    msg.textContent = "참석 여부 전달은 준비 중입니다.";
  }
  let sending = false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending || !url) return;
    const fd = new FormData(form);
    const data = {
      name: (fd.get("name") || "").trim(), attend: fd.get("attend") || "",
      count: Number(fd.get("count")) || 0, meal: fd.get("meal") || "", message: (fd.get("message") || "").trim(),
    };
    const v = validateRsvp(data);
    if (!v.ok) { msg.textContent = v.error; return; }
    sending = true; submit.disabled = true; msg.textContent = "전달 중입니다...";
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.ok) throw new Error("server");
      msg.textContent = "";
      form.reset();
      close();
      document.dispatchEvent(new CustomEvent("rsvp:done"));
    } catch {
      msg.textContent = "전달하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    } finally {
      sending = false; submit.disabled = false;
    }
  });
}
