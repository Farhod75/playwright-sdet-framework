# Playwright SDET Framework

![Playwright Tests](https://github.com/Farhod75/playwright-sdet-framework/actions/workflows/playwright.yml/badge.svg)

Enterprise test automation framework — Playwright + TypeScript.

## Capabilities

- **UI automation** — Page Object Model with inheritance, multi-browser (Chromium/Firefox/WebKit) and mobile viewports
- **API automation** — typed client class, Zod schema validation, contract vs. behavior test layering
- **BDD** — Gherkin feature files via playwright-bdd, step definitions bound to custom fixtures
- **Authentication** — `storageState` session reuse; auth state enforced by project boundaries, not per-file overrides
- **Fixtures** — composed custom fixtures with automatic teardown
- **CI/CD** — GitHub Actions, credentials via repository secrets, JUnit XML output
- **Reporting** — HTML, list, JSON, JUnit

## Run

```bash
npm install
npx playwright install
npm run test:ui        # authenticated UI suite
npm run test:auth      # login/auth suite
npm run test:api       # API suite
npm run test:bdd       # Gherkin scenarios
npm run test:smoke     # smoke subset
```

Copy `.env.example` to `.env` and fill in values.