import { config } from "./config.js";
import { buildCalendar, diffParts, formatKoreanDate, seoulYMD } from "./date-utils.js";

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
    <img class="photo" src="images/cover.svg" alt="" onerror="this.style.visibility='hidden'">
    <p class="names">${config.groom.name} ♡ ${config.bride.name}</p>
    <p class="meta">${formatKoreanDate(target)}<br>${config.venue.name} ${config.venue.hall}</p>`;
}

function renderGreeting() {
  const { groom, bride } = config;
  $("#greeting").innerHTML = `${title("Invitation", "모시는 말씀")}
    <div class="greeting">${config.greeting.map((l) => `<p>${l}</p>`).join("")}</div>
    <p class="parents">${groom.father} · ${groom.mother}의 아들 <b>${groom.name}</b><br>
    ${bride.father} · ${bride.mother}의 딸 <b>${bride.name}</b></p>
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
    $("#dday-text").textContent = r.past
      ? "결혼식이 지났습니다. 함께해 주셔서 감사합니다."
      : r.days === 0 ? "오늘은 D-Day입니다." : `${config.groom.name}, ${config.bride.name}의 결혼식이 ${r.days}일 남았습니다.`;
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
    <div class="grid">${urls.map((u, i) => `<button class="thumb" data-i="${i}" aria-label="사진 ${i + 1} 크게 보기"><img src="${u}" alt="" loading="lazy" onerror="this.closest('.thumb').style.visibility='hidden'"></button>`).join("")}</div>
    <div class="lightbox" id="lightbox" hidden>
      <button class="lb-close" aria-label="닫기">×</button>
      <button class="lb-prev" aria-label="이전">‹</button>
      <img id="lb-img" alt="">
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
    <p><button class="btn" id="copy-addr">주소 복사</button></p>
    <p class="maps">
      <a class="btn" target="_blank" rel="noopener" href="https://map.kakao.com/link/search/${q}">카카오맵</a>
      <a class="btn" target="_blank" rel="noopener" href="https://map.naver.com/p/search/${q}">네이버지도</a>
      <a class="btn" target="_blank" rel="noopener" href="https://tmap.life/">티맵</a>
    </p>
    <dl class="transport">${v.transport.map(([k, t]) => `<dt>${k}</dt><dd>${t}</dd>`).join("")}</dl>`;
  $("#copy-addr").onclick = async () => toast((await copyText(v.address)) ? "주소를 복사했어요" : "복사하지 못했어요. 직접 선택해 주세요");
}

renderGallery();
renderLocation();
