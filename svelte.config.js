import adapter from "@sveltejs/adapter-cloudflare";  // Changed to Cloudflare adapter for Pages compatibility
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import dotenv from "dotenv";
import { execSync } from "child_process";
dotenv.config({ path: "./.env.local" });
dotenv.config({ path: "./.env" });
function getCurrentCommitSHA() {
  try {
    return execSync("git rev-parse HEAD").toString();
  } catch (error) {
    console.error("Error getting current commit SHA:", error);
    return "unknown";
  }
}
process.env.PUBLIC_VERSION ??= process.env.npm_package_version;
process.env.PUBLIC_COMMIT_SHA ??= getCurrentCommitSHA();
/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // Cloudflare-specific options: Define routes to handle all paths as serverless functions
      routes: {
        include: ['/*'],
        exclude: ['<all>']  // Exclude static assets if needed; adjust based on your app
      }
    }),  // Updated adapter call with options for Cloudflare Pages
    paths: {
      base: process.env.APP_BASE || "",
      relative: false,
    },
    csrf: {
      // handled in hooks.server.ts, because we can have multiple valid origins
      checkOrigin: false,
    },
    csp: {
      directives: {
        ...(process.env.ALLOW_IFRAME === "true" ? {} : { "frame-ancestors": ["'none'"] }),
      },
    },
    alias: {
      $api: "./src/lib/server/api",
      "$api/*": "./src/lib/server/api/*",
    },
  },
};
export default config;
