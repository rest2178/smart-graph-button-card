/**
 * Minimal YAML subset parser used ONLY by the tests to validate the example
 * files without adding an npm dependency. Supports block maps, block lists,
 * quoted/unquoted scalars, numbers, booleans, null and comments.
 */
function stripComment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === q) q = null;
    } else if (ch === '"' || ch === "'") q = ch;
    else if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

function scalar(s) {
  const v = s.trim();
  if (v === "") return null;
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null" || v === "~") return null;
  if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(v)) return Number(v);
  return v;
}

function splitKey(content) {
  let q = null;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (q) {
      if (ch === q) q = null;
    } else if (ch === '"' || ch === "'") q = ch;
    else if (ch === ":" && (i === content.length - 1 || content[i + 1] === " ")) {
      return [scalar(content.slice(0, i)), content.slice(i + 1).trim()];
    }
  }
  return null;
}

export function parseSimpleYaml(text) {
  const tokens = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = stripComment(raw).replace(/\s+$/, "");
    if (!line.trim()) continue;
    tokens.push({ indent: line.length - line.trimStart().length, content: line.trim() });
  }
  const isItem = (t) => t.content === "-" || t.content.startsWith("- ");

  function block(i, indent) {
    return isItem(tokens[i]) ? list(i, indent) : map(i, indent);
  }

  function map(i, indent) {
    const out = {};
    while (i < tokens.length && tokens[i].indent === indent && !isItem(tokens[i])) {
      const kv = splitKey(tokens[i].content);
      if (!kv) throw new Error(`Cannot parse line: ${tokens[i].content}`);
      const [key, rest] = kv;
      i++;
      if (rest === "") {
        const next = tokens[i];
        if (next && (next.indent > indent || (next.indent === indent && isItem(next)))) {
          const [val, ni] = block(i, next.indent);
          out[key] = val;
          i = ni;
        } else out[key] = null;
      } else out[key] = scalar(rest);
    }
    return [out, i];
  }

  function list(i, indent) {
    const out = [];
    while (i < tokens.length && tokens[i].indent === indent && isItem(tokens[i])) {
      const rest = tokens[i].content === "-" ? "" : tokens[i].content.slice(2).trim();
      if (rest === "") {
        const [val, ni] = block(i + 1, tokens[i + 1].indent);
        out.push(val);
        i = ni;
      } else if (splitKey(rest)) {
        tokens[i] = { indent: indent + 2, content: rest };
        const [val, ni] = map(i, indent + 2);
        out.push(val);
        i = ni;
      } else {
        out.push(scalar(rest));
        i++;
      }
    }
    return [out, i];
  }

  if (!tokens.length) return null;
  return block(0, tokens[0].indent)[0];
}
