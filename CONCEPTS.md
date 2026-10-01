You're Right — I Skipped the Foundation

I gave you syntax before meaning. That's my mistake. Let's fix it with one concept, properly, using something physical.

(Git error is easy — git init first. We'll do that after.)

One Concept: Constructor
The Real-World Version

Think of a blueprint for a hotel room.

The blueprint says: every room has a door number, a key, and a bed. But a blueprint isn't a room. You can't sleep in it.

When the hotel actually builds room 412, someone hands the builder the number "412". The builder makes a real room and writes 412 on the door.

Blueprint = the class
The act of building one room = the constructor
Room 412 = the object (instance)
The number you hand the builder = the constructor's parameter

You can build 300 rooms from one blueprint. Each gets its own number.

In Your Code
typescript
class HotelRoom {
  roomNumber: number;              // every room HAS a number (the blueprint says so)

  constructor(number: number) {    // ← runs ONCE, when a room is built
    this.roomNumber = number;      // "this" = the specific room being built right now
  }
}

const room412 = new HotelRoom(412);   // build one
const room999 = new HotelRoom(999);   // build another

console.log(room412.roomNumber);   // 412
console.log(room999.roomNumber);   // 999

new = "build me one."
constructor = the instructions that run during building.
this = "the one being built right now" — not the blueprint, not the other rooms.

Now Your Actual Code

Open pages/LoginPage.ts:

typescript
constructor(page: Page) {
  super(page);
  this.usernameInput = page.getByPlaceholder('Username');
}

Read it as: "When someone builds a LoginPage, they must hand me a browser tab. I'll remember where the username box is on that tab."

And in your test:

typescript
const loginPage = new LoginPage(page);

"Build me a LoginPage. Here's the browser tab to use."

Why hand it the page? Because a LoginPage is useless without a browser tab — same as a hotel room is useless without a number. The constructor's job is to demand the things the object cannot exist without.

When You'll Write One Yourself

Every time you make a class. The question to ask:

"What does this thing need in order to exist at all?"

That answer goes in the constructor's parentheses.

Class	Needs to exist	Constructor
LoginPage	a browser tab	constructor(page: Page)
ApiClient	an HTTP client	constructor(request: APIRequestContext)
DatabaseClient	a connection string	constructor(connStr: string)
Check Your Understanding

Don't look at the answer. Open utils/ApiClient.ts and answer out loud:

What does ApiClient need in order to exist?
Where in the file did you look to find that?

Tell me your answer, and then we'll do interface / type the same way. One concept per message, physical example first, your code second.

Both Correct ✅

You spotted Promise { <pending> } immediately — that's the recognition that saves debugging time.

Your Question: ${...} — Template Literals
The Real-World Version

Think of a rubber stamp with a blank space.

INVOICE #______  —  PAID

The stamp is fixed text with a hole in it. Every time you use it, you write a different number in the hole. The surrounding text never changes.

${...} is that hole.

The Two Ways to Build a String
typescript
const id = 2;

// OLD WAY — glue pieces together with +
const path = '/users/' + id;        // "/users/2"

// TEMPLATE LITERAL — one string with a hole in it
const path = `/users/${id}`;        // "/users/2"

Both give the same result. The second is easier to read.

The Critical Detail: Backticks

Look carefully at the quote marks:

typescript
'/users/${id}'    // ❌ single quotes → literally prints:  /users/${id}
"/users/${id}"    // ❌ double quotes → literally prints:  /users/${id}
`/users/${id}`    // ✅ BACKTICKS     → prints:            /users/2

${...} only works inside backticks. With normal quotes it's just text.

The backtick key is above Tab, left of the 1 key. Same key as ~.

This is a genuinely common beginner bug — the code runs, no error, but your URL is literally /users/${id} and you get a 404. If a path looks wrong in a trace, check your quote marks first.

What Goes In the Hole

Anything that produces a value:

typescript
const name = 'Farhod';
const count = 6;

`Hello ${name}`                    // "Hello Farhod"
`Total: ${count * 2}`              // "Total: 12"          ← math works
`User: ${user.email}`              // "User: a@b.com"      ← property access
`Path: ${'/users/' + id}`          // works, but pointless
In Your Actual Code
typescript
async getUser(id: number): Promise<APIResponse> {
  return await this.request.get(`/users/${id}`);
}

Call it with getUser(2) → the request goes to /users/2.
Call it with getUser(9999) → /users/9999.

One stamp, different numbers in the hole. That's why the method is reusable.

You also used it in BasePage.ts:

typescript
path: `test-results/screenshots/${name}.png`,

Pass 'login-error' → test-results/screenshots/login-error.png.

Bonus: Multi-Line Strings

Backticks have a second superpower — they preserve line breaks:

typescript
const query = `
  SELECT id, email
  FROM users
  WHERE active = true
`;

With normal quotes that's a syntax error. You'll use this constantly in Week 2 when we write SQL.

Check Your Understanding

Answer out loud:

What does this print?
typescript
const project = 'idris';
console.log('Building ${project}');
In ApiClient.ts, if you changed the backticks to single quotes on the getUser line, what URL would the request hit — and what status would come back?
prints 'Building ${project}' as text. 2. 404 not found
Both Correct ✅

You even predicted the 404 without running it. That's exactly the reasoning that makes debugging fast.

Next Concept: extends — Inheritance
The Real-World Version

Think about driving licenses.

Everyone who drives anything must know: traffic lights, road signs, right of way, speed limits. That's the base license.

A truck driver knows all of that, plus: air brakes, load weights, logbooks.
A motorcyclist knows all of that, plus: lane positioning, counter-steering.

Nobody re-teaches traffic lights to the truck driver. They already have the base. They just add what's specific to trucks.

extends means: "start with everything the base has, then add my own."

In Code
typescript
class Driver {
  stop() { console.log('Stopping at red light'); }
}

class TruckDriver extends Driver {
  checkAirBrakes() { console.log('Checking air brakes'); }
}

const bob = new TruckDriver();
bob.checkAirBrakes();   // ✅ his own method
bob.stop();             // ✅ inherited — he never had to define it

Bob got stop() free. It lives in Driver, but he can use it.

Now Your Actual Code

Open pages/LoginPage.ts, line 1 of the class:

typescript
export class LoginPage extends BasePage {

That means: "LoginPage already knows everything BasePage knows."

BasePage has:

typescript
async navigate(path: string): Promise<void>
async getTitle(): Promise<string>
async takeScreenshot(name: string): Promise<void>
async isElementVisible(locator: Locator): Promise<boolean>

Now look at what LoginPage does with that:

typescript
async goto(): Promise<void> {
  await this.navigate('/');       // ← inherited from BasePage
}

async isErrorVisible(): Promise<boolean> {
  return await this.isElementVisible(this.errorMessage, 3000);   // ← inherited
}

LoginPage never defines navigate() or isElementVisible(). It just uses them. Same as Bob and stop().

ProductsPage extends BasePage too — so both get those methods, written once.

The super(page) Line

Look at the constructor:

typescript
constructor(page: Page) {
  super(page);              // ← what is this?
  this.usernameInput = page.getByPlaceholder('Username');
}

super(page) calls the parent's constructor.

License version: before you can add truck training, you must first complete the base license course. You can't skip it.

BasePage's constructor does:

typescript
constructor(page: Page) {
  this.page = page;         // stores the browser tab
}

So super(page) is what makes this.page exist. Without it, every inherited method that uses this.page would break.

The rule: super() must be the first line, before any this. TypeScript enforces this — it won't let you use this until the parent has finished setting up.

Why This Matters for Your Framework

Say you want screenshots on every page. Add it once to BasePage:

typescript
async logCurrentUrl(): Promise<void> {
  console.log(`Currently at: ${this.getCurrentUrl()}`);
}

LoginPage, ProductsPage, CartPage, and every future page gets it instantly. Zero edits to those files.

That's the payoff: shared behavior lives in one place.

The Interview Sentence

"BasePage holds behavior common to every page — navigation, screenshots, visibility helpers. Each page object extends it and adds only its own locators and actions. When I need a new shared capability, I add it once to BasePage and every page inherits it."

Check Your Understanding

Answer out loud:

In ProductsPage.ts, getCartItemCount() calls this.isElementVisible(...). Where is that method actually written?
If you deleted super(page) from LoginPage's constructor, what would break — and why?

Symbol: { } in Function Arguments — Destructuring
The Real-World Version

A delivery van pulls up with a big box of supplies — bandages, syringes, gloves, masks, scissors, tape.

You only need gloves and scissors.

Old way: take the whole box inside, then reach in twice.
Destructuring: tell the driver at the door — "just hand me the gloves and the scissors." You never carry the box.

In Code
typescript
const box = { gloves: 'blue', scissors: 'sharp', tape: 'white' };

// OLD WAY — take the box, reach in
function useOld(box) {
  console.log(box.gloves);
  console.log(box.scissors);
}

// DESTRUCTURING — name what you want at the door
function useNew({ gloves, scissors }) {
  console.log(gloves);      // no "box." prefix needed
  console.log(scissors);
}

The { } in the parameter list means: "unpack these specific items out of the object I'm given."

Now Your Actual Code
typescript
test('my test', async ({ page }) => { ... });

Playwright hands your test a big box containing page, request, context, browser, browserName, and every fixture you defined.

The { page } says: "just hand me the page." Everything else stays in the van.

typescript
test('...', async ({ loginPage, productsPage }) => { ... });

"Hand me these two."

And this is exactly why unrequested fixtures don't run — you never asked for them at the door, so they were never even loaded onto the van.

Same Symbol, Same Meaning, Different Place

You've also seen it here, in pages.fixture.ts:

typescript
api: async ({ request }, use) => { ... }

The fixture itself is unpacking request from its box. Fixtures get boxes too.

And here, in ProductsPage.ts:

typescript
this.productItems.filter({ hasText: productName })

Careful — this one is different. In an argument position it's unpacking. Here it's the opposite: you're building a small box to hand to filter(). Same braces, opposite direction.

Where	What it does
function f({ a, b })	unpacks — takes items out
f({ a: 1, b: 2 })	packs — builds a box to give

Left of the =>, you're receiving. Inside a call, you're sending.

Why Playwright Chose This

It means you can add fifty fixtures to your framework and every existing test keeps working untouched. Each test only names what it wants. Nothing breaks when the box gets bigger.

Check Your Understanding

Answer out loud:

In async ({ page, request }), how many things did you ask for out of the box?
Is the { } in page.screenshot({ path: 'x.png' }) packing or unpacking?
2 page, request. 2. packing