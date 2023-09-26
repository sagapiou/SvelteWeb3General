import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";

// https://vitejs.dev/config/
export default defineConfig({
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
  plugins: [svelte()],
});