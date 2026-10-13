import { config } from "./config.js";
import { parentsLine } from "./format.js";
import { initRsvp } from "./rsvp.js";
import { buildCalendar, diffParts, formatKoreanDate, seoulYMD, daysUntil } from "./date-utils.js";

const $ = (s) => document.querySelector(s);
const target = new Date(config.weddingDate);
const ymd = seoulYMD(target);

export function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
}

function title(en, ko) {
  return `<h2>${en}<small>${ko}</small></h2>`;
}

function renderCover() {
  $("#cover").innerHTML = `
    <div class="eyebrow">SAVE THE DATE</div>
    <div class="date-big">${String(ymd.month + 1).padStart(2, "0")} • ${String(ymd.day).padStart(2, "0")}</div>
    <img class="photo" src="${config.cover}" alt="" onerror="this.style.visibility='hidden'">
    <p class="names">${config.groom.name} ♡ ${config.bride.name}</p>
    <p class="meta">${formatKoreanDate(target)}<br>${config.venue.name} ${config.venue.hall}</p>`;
}

function renderGreeting() {
  const { groom, bride } = config;
  $("#greeting").innerHTML = `${title("Invitation", "모시는 말씀")}
    <div class="greeting">${config.greeting.map((l) => `<p>${l}</p>`).join("")}</div>
    <p class="parents">${parentsLine(groom, "아들")} <b>${groom.name}</b><br>
    ${parentsLine(bride, "딸")} <b>${bride.name}</b></p>
    <p><a class="btn" href="tel:${groom.phone}">신랑에게 연락</a> <a class="btn" href="tel:${bride.phone}">신부에게 연락</a></p>`;
}

function renderCalendar() {
  const { year: y, month: m, day: d } = ymd;
  const weeks = buildCalendar(y, m);
  const head = ["일", "월", "화", "수", "목", "금", "토"].map((x) => `<th>${x}</th>`).join("");
  const rows = weeks.map((w) => `<tr>${w.map((c) => `<td${c === d ? ' class="today"' : ""}>${c ? `<span>${c}</span>` : ""}</td>`).join("")}</tr>`).join("");
  $("#calendar").innerHTML = `${title("Wedding day", "예식 안내")}
    <p>${formatKoreanDate(target)}</p>
    <table class="cal"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
    <div class="countdown" id="countdown"></div>
    <p id="dday-text"></p>`;
  const tick = () => {
    const r = diffParts(target, new Date());
    $("#countdown").innerHTML = r.past ? "" : [["DAYS", r.days], ["HOUR", r.hours], ["MIN", r.minutes], ["SEC", r.seconds]]
      .map(([l, v]) => `<div><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
    const n = daysUntil(target, new Date());
    $("#dday-text").textContent = n < 0
      ? "결혼식이 지났습니다. 함께해 주셔서 감사합니다."
      : n === 0 ? "오늘은 D-Day입니다." : `${config.groom.name}, ${config.bride.name}의 결혼식이 ${n}일 남았습니다.`;
  };
  tick();
  setInterval(tick, 1000);
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("is-visible"));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }), { threshold: 0.1 });
  els.forEach((e) => io.observe(e));
}

renderCover();
renderGreeting();
renderCalendar();
initReveal();

// ---- Gallery ----
function renderGallery() {
  const urls = config.gallery;
  $("#gallery").innerHTML = `${title("Gallery", "갤러리")}
    <div class="grid">${urls.map((u, i) => `<button class="thumb" data-i="${i}" aria-label="사진 ${i + 1} 크게 보기"><img src="${u}" alt="" loading="lazy" draggable="false" onerror="this.closest('.thumb').style.visibility='hidden'"></button>`).join("")}</div>
    <div class="lightbox" id="lightbox" hidden>
      <button class="lb-close" aria-label="닫기">×</button>
      <button class="lb-prev" aria-label="이전">‹</button>
      <img id="lb-img" alt="" draggable="false">
      <button class="lb-next" aria-label="다음">›</button>
    </div>`;
  const lb = $("#lightbox"), img = $("#lb-img");
  let cur = 0;
  const show = (i) => { cur = (i + urls.length) % urls.length; img.src = urls[cur]; };
  const close = () => { lb.hidden = true; };
  $("#gallery").addEventListener("click", (e) => {
    const t = e.target.closest(".thumb");
    if (t) { show(Number(t.dataset.i)); lb.hidden = false; }
  });
  lb.querySelector(".lb-close").onclick = close;
  lb.querySelector(".lb-prev").onclick = () => show(cur - 1);
  lb.querySelector(".lb-next").onclick = () => show(cur + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

// ---- Location ----
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

function renderLocation() {
  const v = config.venue, q = encodeURIComponent(v.address);
  $("#location").innerHTML = `${title("Location", "오시는 길")}
    <p><b>${v.name}</b> ${v.hall}<br>${v.address}</p>
    <p class="maps">
      <button class="btn" id="copy-addr">주소 복사</button>
      <a class="btn" target="_blank" rel="noopener" href="https://map.kakao.com/link/search/${q}">카카오맵</a>
      <a class="btn" target="_blank" rel="noopener" href="https://map.naver.com/p/search/${q}">네이버지도</a>
      <a class="btn" target="_blank" rel="noopener" href="https://tmap.life/">티맵</a>
    </p>
    <img class="venue-map" src="images/venue-map.svg" alt="루이비스컨벤션 약도: 문정역 4번 출구 앞에서 셔틀버스를 타고 C/D동 주차장 입구에서 내립니다" draggable="false">
    <p class="map-note">※ 실제 축척과 다른 약도입니다.</p>
    <div class="transport">${v.transport.map((g) => `
      <h3>${g.title}${g.sub ? ` <small>${g.sub}</small>` : ""}</h3>
      <div class="t-body">
        ${(g.lines || []).map((l) => `<p>${l}</p>`).join("")}
        ${g.rows ? `<dl>${g.rows.map(([k, t]) => `<dt>${k}</dt><dd>${t}</dd>`).join("")}</dl>` : ""}
        ${g.warn ? `<p class="warn">※ ${g.warn}</p>` : ""}
      </div>`).join("")}</div>`;
  $("#copy-addr").onclick = async () => toast((await copyText(v.address)) ? "주소를 복사했어요" : "복사하지 못했어요. 직접 선택해 주세요");
}

renderGallery();
renderLocation();

// ---- Notice (RSVP only) ----
initRsvp($("#notice"), config.rsvpUrl);
document.addEventListener("rsvp:done", () => toast("참석 여부가 전달되었습니다. 감사합니다!"));

// ---- Account ----
function renderAccount() {
  const block = (label, list) => `<details><summary>${label}</summary>${list.map((a) => `
    <div class="acct"><span>${[a.bank, a.number].filter(Boolean).join(" ")}<br><small>${a.role}</small></span>
    <button class="btn" data-copy="${a.number}">복사</button></div>`).join("")}</details>`;
  $("#account").innerHTML = `${title("Account", "마음 전하실 곳")}
    <p>전해주시는 따뜻한 축하의 마음을<br>오래도록 간직하여 행복하게 잘 살겠습니다.</p>
    ${config.accounts.groom.length ? block("신랑측 계좌번호", config.accounts.groom) : ""}${config.accounts.bride.length ? block("신부측 계좌번호", config.accounts.bride) : ""}`;
  $("#account").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]");
    if (b) toast((await copyText(b.dataset.copy)) ? "계좌번호를 복사했어요" : "복사하지 못했어요");
  });
}

// ---- Footer ----
function renderFooter() {
  $("#footer").innerHTML = `<p><button class="btn solid" id="share">청첩장 공유하기</button>
    <button class="btn" id="copy-link">링크 복사하기</button></p>
    <p class="meta">${config.groom.name} ♡ ${config.bride.name}</p>`;
  const copy = async () => toast((await copyText(location.href)) ? "링크를 복사했어요" : "복사하지 못했어요");
  $("#copy-link").onclick = copy;
  $("#share").onclick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url: location.href }); } catch { /* 사용자 취소 */ }
    } else copy();
  };
}

renderAccount();
renderFooter();
