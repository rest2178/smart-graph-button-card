/**
 * Zero-dependency bundler for this project (fallback when Rollup is not
 * available, e.g. `node scripts/build.mjs`).
 *
 * Supports exactly the module syntax used in src/:
 *   import { a, b as c } from "./x.js";
 *   export const|let|function|async function|class name …
 *   export { a, b as c };
 * Every module is wrapped in its own function scope, so top-level names never
 * collide. Bare (npm/CDN) imports are rejected – the output has no runtime
 * dependencies.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(root, "src/smart-graph-button-card.js");
const outFile = resolve(root, "dist/smart-graph-button-card.js");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const IMPORT_RE = /^\s*import\s+(?:\{([^}]*)\}\s+from\s+)?["']([^"']+)["'];?[ \t]*$/gm;
const modules = new Map(); // path -> { id, code, exports, deps }
const order = [];

function modId(file) {
  return "__m_" + relative(resolve(root, "src"), file).replace(/[^a-zA-Z0-9]/g, "_");
}

function load(file, stack = []) {
  if (modules.has(file)) return;
  if (stack.includes(file)) throw new Error(`Circular import: ${[...stack, file].map((f) => relative(root, f)).join(" -> ")}`);
  let code = readFileSync(file, "utf8");
  const deps = [];
  code = code.replace(IMPORT_RE, (_m, names, spec) => {
    if (!spec.startsWith("./") && !spec.startsWith("../")) throw new Error(`External import "${spec}" in ${relative(root, file)} is not allowed`);
    const depFile = resolve(dirname(file), spec);
    deps.push(depFile);
    load(depFile, [...stack, file]);
    if (!names) return "";
    const binds = names
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [orig, alias] = s.split(/\s+as\s+/);
        return alias ? `${orig}: ${alias}` : orig;
      });
    return `const { ${binds.join(", ")} } = ${modId(depFile)};`;
  });
  if (/^\s*import\s/m.test(code)) throw new Error(`Unsupported import syntax in ${relative(root, file)}`);
  if (/^\s*export\s+default\b/m.test(code)) throw new Error(`export default is not supported (${relative(root, file)})`);

  const exportsList = [];
  code = code.replace(/^export\s+((?:async\s+)?function\*?\s+([A-Za-z_$][\w$]*)|class\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*))/gm, (m, decl, fn, cls, v) => {
    exportsList.push(fn || cls || v);
    return decl;
  });
  code = code.replace(/^export\s*\{([^}]*)\};?/gm, (_m, names) => {
    for (const part of names.split(",").map((s) => s.trim()).filter(Boolean)) {
      const [orig, alias] = part.split(/\s+as\s+/);
      exportsList.push(alias ? `${alias}: ${orig}` : orig);
    }
    return "";
  });
  if (/^\s*export\s/m.test(code)) throw new Error(`Unsupported export syntax in ${relative(root, file)}`);
  modules.set(file, { id: modId(file), code, exports: exportsList, deps });
  order.push(file);
}

load(entry);

const banner = `/*! Smart Graph Button Card v${pkg.version} | ${pkg.license} License | no external dependencies */\n`;
let out = banner;
for (const file of order) {
  const m = modules.get(file);
  out += `\n// ---- ${relative(root, file)}\nconst ${m.id} = (() => {\n${m.code.trim()}\nreturn { ${m.exports.join(", ")} };\n})();\n`;
}
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, out);
console.log(`Built ${relative(root, outFile)} (${(out.length / 1024).toFixed(1)} KiB) from ${order.length} modules`);
