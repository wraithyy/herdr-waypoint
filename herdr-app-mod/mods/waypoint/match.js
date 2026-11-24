// Waypoint search ranking, free of herdr imports so bun can test it.

const subsequence = (hay, f) => {
  let i = 0;
  for (const ch of hay) if (ch === f[i]) i++;
  return i === f.length;
};

// Lower is better; null = no match. The name counts before the path, and the path is
// matched without the home prefix, which every waypoint shares and so matched anything.
export function score(item, f) {
  const name = item.name.toLowerCase();
  const path = item.path.replace(/^\/Users\/[^/]+/, "~").toLowerCase();
  if (name.startsWith(f)) return 0;
  if (name.includes(f)) return 1;
  if (subsequence(name, f)) return 2;
  if (path.includes(f)) return 3;
  if (subsequence(path, f)) return 4;
  return null;
}
