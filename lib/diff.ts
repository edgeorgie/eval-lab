export type Op = "same" | "add" | "del";

export interface Seg {
  op: Op;
  text: string;
}

/** Word-level diff using the longest common subsequence. Outputs are short, so O(n*m) is fine. */
export function wordDiff(a: string, b: string): Seg[] {
  const x = a.split(/(\s+)/).filter(Boolean);
  const y = b.split(/(\s+)/).filter(Boolean);
  const n = x.length;
  const m = y.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: Seg[] = [];
  const push = (op: Op, text: string) => {
    const last = out[out.length - 1];
    if (last && last.op === op) last.text += text;
    else out.push({ op, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      push("same", x[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push("del", x[i++]);
    } else {
      push("add", y[j++]);
    }
  }
  while (i < n) push("del", x[i++]);
  while (j < m) push("add", y[j++]);
  return out;
}

/** Share of words the two texts have in common, from 0 to 1. */
export function similarity(a: string, b: string): number {
  const segs = wordDiff(a, b);
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const same = segs.filter((s) => s.op === "same").reduce((t, s) => t + words(s.text), 0);
  const total = Math.max(words(a), words(b));
  return total === 0 ? 1 : same / total;
}
