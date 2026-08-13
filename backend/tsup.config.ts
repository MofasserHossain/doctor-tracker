import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/seed.ts"],
  format: ["esm"],
  sourcemap: true,
  clean: true,
  dts: false,
  target: "node20",
  splitting: false,
  treeshake: true,
});
