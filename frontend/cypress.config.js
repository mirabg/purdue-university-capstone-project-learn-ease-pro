import { defineConfig } from "cypress";
import { startDevServer } from "@cypress/vite-dev-server";
import path from "path";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // Vite dev server integration for Cypress
      on("dev-server:start", (options) => {
        return startDevServer({
          options,
          viteConfig: {
            configFile: path.resolve(__dirname, "./vite.config.js"),
          },
        });
      });
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    video: false,
    screenshotOnRunFailure: true,
  },
  env: {
    apiUrl: "http://localhost:3000/api",
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
});
