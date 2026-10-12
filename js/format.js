export function parentsLine(p, role) {
  const names = [p.father, p.mother].filter(Boolean).join(" · ");
  return `${names}의 ${role}`;
}
