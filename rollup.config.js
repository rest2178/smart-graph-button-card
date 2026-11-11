import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/smart-graph-button-card.js",
  output: {
    file: "dist/smart-graph-button-card.js",
    format: "es",
    sourcemap: false,
    inlineDynamicImports: true,
  },
  // Only relative imports exist in src/ – anything else is an error, so no
  // runtime dependency can slip into the bundle.
  external: () => false,
  onwarn(warning, warn) {
    if (warning.code === "UNRESOLVED_IMPORT") throw new Error(`Unresolved import: ${warning.exporter || warning.message}`);
    warn(warning);
  },
  plugins: [
    production &&
      terser({
        format: { comments: /^!/ },
        compress: { passes: 2 },
      }),
  ],
};
