The Honest Reframe

For interviews, you need maybe 8 concepts you can explain out loud. Not 80 commands. Interviewers ask "how do you handle authentication in a large suite?" — they never ask you to recite extraHTTPHeaders syntax.

For project work, you need to know that a thing exists and where to look it up. That's it.

The gap between those two is where anxiety lives, and it's mostly imaginary.

Your Consolidation System

1. Spaced repetition, 10 min/day. Not re-reading — retrieval. Close the laptop, explain "why storageState" out loud. If you stumble, that's the signal to review. Struggling to recall is what builds the memory; re-reading feels productive and isn't.

2. Teach it. Write a LinkedIn post explaining one concept per week. You're job hunting in Charlotte anyway — this doubles as visibility. Explaining forces retrieval and exposes gaps instantly.

3. Rebuild from scratch on day 21. New folder, no copy-paste, config + one page object + one fixture. You'll be shocked how much is already yours. What isn't, you'll never forget after looking it up under pressure.

4. Keep one reference doc. Below.

Your Cheat Sheet

Save this in your repo root as CHEATSHEET.md. It's your lookup table — not something to memorize.

<invoke name="artifacts"> <parameter name="command">create</parameter> <parameter name="id">playwright-cheatsheet</parameter> <parameter name="type">text/markdown</parameter> <parameter name="title">Playwright SDET Cheat Sheet — Days 1–5</parameter> <parameter name="content"># Playwright SDET Framework — Reference

Keep this in your repo root. Look things up here. Don't memorize it.

PART 1 — The 8 Interview Concepts

These are the only things you need to explain out loud, without notes.

1. Why Playwright over Selenium

Auto-waiting removes explicit waits. Browser contexts give real isolation without restarting browsers. Trace viewer gives time-travel debugging. Built-in API testing. Parallel by default.

2. Page Object Model

Each page gets a class holding its locators and actions. Tests call business methods (login()), not selectors. UI changes = edit one class, not 47 test files.

3. Fixtures vs beforeEach

Fixtures are dependency-injected, composable (one can depend on another), lazy (only run if requested), and keep setup + teardown in one function around await use(). beforeEach is none of those.

4. storageState authentication

Log in once in a setup project, serialize cookies + localStorage to JSON, every other project loads it. On 500 tests that removes ~25 minutes of redundant logins.

5. Auth separation by project, not by file

Authenticated tests live in one folder with storageState set. Auth tests live in another with storageState: undefined. New files inherit correct behavior from location — nothing to forget.

6. Contract vs behavior testing

Schema validates shape, types, formats. Explicit assertions validate logic — status codes, filtering, ordering, business rules. One contract test per endpoint; behavior tests for what schema can't reach.

7. State seeding (hybrid pattern)

Arrange via the fastest reliable path (API or localStorage). Act and assert through the layer under test. A checkout test shouldn't click through registration.

8. Reporter strategy

HTML for humans, list for console, JSON for KPI dashboards, JUnit XML because Jenkins and Azure DevOps parse it natively for trend graphs and flakiness history.

PART 2 — Command Reference
powershell
npx playwright test --list          # SHOW routing without running — use constantly
npx playwright test --ui            # interactive mode, watch + timeline
npx playwright test --debug         # step through with inspector
npx playwright codegen <url>        # record actions, generates locators
npx playwright show-trace <zip>     # post-mortem on a failure
npx playwright show-report          # open HTML report

PowerShell: quote anything with @, $, |, &
npx playwright test --grep "@smoke" ✅    --grep @smoke ❌

PART 3 — Locator Priority
1. getByRole('button', { name: 'Submit' })   ← best, accessibility-first
2. getByLabel / getByPlaceholder / getByText
3. getByTestId('submit-btn')
4. locator('.css-class')
5. locator('//xpath')                        ← last resort

Narrowing:

typescript
items.filter({ hasText: 'Backpack' })        // by content
items.filter({ hasText: 'X' }).locator('button')  // then drill in
items.first() / .last() / .nth(2)
await items.count()
await items.allTextContents()
PART 4 — Config Rules
Rule	Detail
Precedence	global use → project use → test.use() → per-call
Override is shallow	project extraHTTPHeaders replaces global — no merge
testDir on project	overrides global testDir
dependencies: ['setup']	setup completes before project starts
storageState: undefined	explicitly clean browser

Mental model: A project = a folder + a browser + an auth state.

Test count math: Σ (tests in file × projects including that file)
If --list shows a number you can't explain, routing is wrong.

PART 5 — Fixture Pattern
typescript
type MyFixtures = { myThing: MyClass };      // 1. declare the contract

export const test = base.extend<MyFixtures>({
  myThing: async ({ page }, use) => {        // 2. implement it
    const thing = new MyClass(page);         //    setup
    await use(thing);                        //    ← test runs here
                                             //    teardown
  },
});

Every key in the type needs a key in extend. TypeScript won't catch the mismatch — extend accepts partials. You'll get a runtime error: Fixture "X" has unknown parameter "Y".

PART 6 — API Testing
typescript
const res = await request.get('/path');   // 1. call
expect(res.status()).toBe(200);           // 2. STATUS FIRST
const body = await res.json();            // 3. then body
Option	Sends as
data: {}	JSON body
params: {}	query string (auto-encoded)
form: {}	URL-encoded
headers: {}	per-call override

Assert the contract, not the data — for data you don't control, check shape/type/format. Exact values only for data your test created.

Always verify a filter filtered:

typescript
expect(posts.every((p) => p.userId === 1)).toBe(true);

Custom failure messages (second arg to expect):

typescript
expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
PART 7 — Debugging Ladder

Climb in order. Skipping steps turns 5 minutes into an hour.

#	Do this	Rules out
1	Ctrl+K S (save all)	unsaved buffer
2	npx playwright test --list	wrong project / testDir
3	console.log(process.env.X)	env not loaded
4	trace viewer → Network → Request Headers	header not attached
5	reproduce with curl.exe	your code vs. the API

Status codes:

Code	Almost always
401	missing/invalid auth
403	authenticated, not permitted
404	wrong path — or baseURL didn't apply
429	rate limited
5xx	their problem, not yours

Uniform 401 everywhere (including a "should be 404") = gateway rejected before routing. Credentials, not paths.

cf-cache-status: HIT or Age: > 0 = you're reading a cached response, not the live service.

PART 8 — Gotchas That Cost Time

|| protects against missing, never against wrong

typescript
process.env.API_KEY || 'default'

A placeholder like your_key_here is truthy and sails through. Never put placeholders in .env — only in .env.example.

page.evaluate() has no access to Node scope

typescript
await page.evaluate((ids) => localStorage.setItem('k', JSON.stringify(ids)), [1,2]);
//                   ↑ pass as 2nd arg                                        ↑

.sort() mutates — always copy first

typescript
const expected = [...prices].sort((a, b) => a - b);

Headed mode is ~3× slower — debugging only, never CI.

PART 9 — CT-GenAI Bridges

Everything above maps to AI testing. The through-line: control everything you aren't measuring.

Framework concept	CT-GenAI concept
storageState / fixed setup	controlling test preconditions for non-determinism
--list before running	static verification before expensive evaluation
status → shape → content	transport / structural / semantic layering
schema .safeParse()	deterministic guardrail around a non-deterministic generator
schema error → retry	self-correction / repair strategy
ApiClient wrapper	abstraction seam for stubbing, logging, guardrails
state seeding	isolating a pipeline component (fix retrieval, test generation)
infra failure ≠ test failure	exclude 401s from model quality scores
resolved config logging	reproducibility — record effective config + model version
assert contract not data	property-based / metamorphic oracles

The exam sentence: "Fix everything you can fix — temperature, seed, prompt, context — so the only variable left is the one under test."

PART 10 — Where You Are
Capability	Status
Playwright + TypeScript, multi-browser	✅
Page Object Model with inheritance	✅
Composed custom fixtures	✅
storageState auth + project separation	✅
Tagged smoke / regression suites	✅
Multi-reporter incl. JUnit XML	✅
API client + schema validation	✅
Hybrid UI+API state seeding	✅
SQL / data validation	⬜ Week 2
GitHub Actions / Jenkins / Azure DevOps	⬜ Week 3
AI-assisted testing, self-healing locators	⬜ Week 4