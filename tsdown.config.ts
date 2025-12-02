import { defineConfig } from "tsdown";
import removeAttr from "remove-attr";

export default defineConfig({
  entry: ["./src/index.ts"],
  platform: "neutral",
  dts: true,
  plugins: [
    removeAttr({
      extensions: ["tsx"],
      attributes: ["data-testid"],
    }),
  ],
});
