export function buildCalendar(year, month) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: last }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function diffParts(target, now) {
  const ms = target - now;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    past: false,
  };
}

export function formatKoreanDate(d) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric",
      weekday: "long", hour: "numeric", minute: "numeric", hourCycle: "h23",
    }).formatToParts(d).map((x) => [x.type, x.value])
  );
  const h = Number(p.hour);
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${p.year}년 ${p.month}월 ${p.day}일 ${p.weekday} ${period} ${h12}시 ${p.minute}분`;
}
