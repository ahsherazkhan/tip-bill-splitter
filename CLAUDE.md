# Project rules

This is a take-home assignment for a Product Engineering role: a tip and bill splitter that runs in a web browser. I direct the work, review everything and test the app myself. You write the code and help me draft three product documents, in this order: docs/app-roles.md, docs/jobs-to-be-done.md and docs/user-stories.md.

## What good looks like
- A small app that fully works and is well specified beats a big one that doesn't.
- The documents and the README must describe exactly what was built. Never claim something works unless it was verified.
- Every claim in a doc or the README is backed by a passing test, a command that was run, or a check that was done and recorded. If something was not checked, say so plainly.
- A story is Implemented only when every one of its acceptance criteria has passed, by an automated test or by a manual check I confirmed. Otherwise it is Not implemented.

## Technical rules
- Plain HTML, CSS and JavaScript. No build step, no dependencies, no frameworks and no ES modules, so the app opens by double-clicking src/index.html.
- Nothing is loaded from outside: no network requests, no external fonts or libraries.
- Logic lives in plain CommonJS-style files that also load as classic browser scripts and through require() in Node. package.json must not set "type": "module".
- Money is integer cents. Never use floating point for amounts.
- Keep the UI thin. app.js only reads the fields, calls the pure view-model function and writes the result to the page. No money logic and no message text in app.js.
- Every message the user can see lives in one constants file, and the docs quote those exact strings.
- Never show NaN, Infinity, undefined or exponent notation on the page.
- Tests use node:test and run with `node --test` on Node 20 or newer. Test files are named *.test.js, and test names start with the criterion id, such as S-1.1. Tests that guard the docs or the page files start with DOCS- or PAGE- instead of a criterion id. Keep the tests free of anything newer than Node 20.

## Working rules
- Don't add features, dependencies or files beyond what we agree. Ask before large changes.
- If a criterion in the docs looks wrong or impossible, tell me. Don't change it quietly.
- Don't say something is verified in a browser unless you ran it there. I check browser behavior myself.
- If I edit anything by hand, I'll tell you, and it goes in the README.
- Commit locally after each stage (setup, docs, logic and tests, UI, fixes, test report and README) with a clear message. Never push and never add a remote.
- Keep the assessment and the reviewers out of code comments, UI text and the three product docs. The README can mention that this is a take-home.
- Don't copy the assignment brief into any file in this repository, except the unedited transcript.
- Keep replies short and in plain English, and say what you changed.
- Run `npm test` before you call a stage done, and report the real counts.
- To show that the tests catch bugs, plant one bug at a time in a throwaway copy outside the project, never in the working tree, and say which test failed.
- Leave no placeholders (TODO or bracketed fill-ins) in a committed file. If you need a fact only I have, such as a model name or a browser version, ask me.
- Keep temporary tooling out of the project. If a preview server needs a config file, it goes in the git-ignored .claude/ folder and is deleted afterwards.

## Decisions

### Product
- One role: a person at a restaurant table who pays the check and tells everyone what they owe. The split is equal. Don't invent a second role.
- The one real "must never" is showing a wrong or stale amount: shares that don't add up to the total, or an old result after an input became invalid. Don't invent others.
- The inputs are the bill amount, the tip percentage (default 15) and the number of people (default 2).
- Live as I type, the app shows the tip, the total, each person's share and a line saying how an uneven split is shared. It has a Reset button.
- Not in v1: quick-tip buttons, rounding the total up, splitting by items, adding tax separately. Two of them, which we choose when we write the stories, are documented as Not implemented stories. The others are listed as out of scope.
- I test by hand in Chrome and Safari. The README and the test report list only the browsers I actually tested, with their versions.
- I publish the repo on GitHub (public) and push it myself at the end.

### Money
- Integer cents only, as above. The tip percentage is stored as basis points (15% is 1500).
- The tip is the bill as entered times the percentage, rounded half-up to the cent, once, on the whole bill. The total is the bill plus the tip.
- If the total doesn't divide evenly, the leftover cents go one each to the first people. The result says so. The shares add up exactly to the total.
- Limits: bill 0.01 to 1000000.00, tip 0 to 100 with up to two decimals, people 1 to 50 as whole numbers. Anything else gets a clear message and no result.
- A bill of 0.01 split three ways (0.01, 0.00, 0.00) is allowed and shown honestly.

### Inputs and display
- All three fields are text fields that we validate ourselves. Bill and tip use inputmode="decimal". People uses inputmode="numeric". No input type=number: it returns an empty value for invalid text, so we can't tell empty from invalid.
- Bill and tip: digits plus one optional decimal point, at most two decimals. ".5" and "5." are fine. "." on its own is not.
- People: digits only. "2.5", "2.0" and "2." are rejected.
- All three: leading zeros are fine ("007" is 7). Spaces, tabs and non-breaking spaces at the ends are ignored. Commas, signs, exponents, letters and digits from other scripts are rejected.
- If a value has too many decimals and is also out of range (a bill of 0.005), the decimals message wins.
- An empty bill is never an error: there is just no result yet. That covers the first open, the state after Reset, and a bill I delete. An empty tip field or an empty people field is an error with its own message.
- Amounts show two decimals, with no currency symbol and no thousands separators, so what you read is what you can type.

### UI
- One pure function takes the raw input strings and returns everything the page shows: messages, formatted amounts, which fields are in error, the split line and the state after Reset. app.js only reads the fields, calls it and writes the result to the page. That way I can test the messages without a browser.
- Static labels (field names, button text, headings) are not messages and stay in index.html. The every-message rule covers only text the app produces at run time, such as errors, results and the split line.
- Each message shows under the field that caused it, in an aria-live="polite" box linked to the input.
- The Result box is emptied and hidden whenever any entry is invalid, so a message and an old amount never show together.
- The shares are a numbered list under "Each person pays".
- The button is called Reset. It puts the defaults back, clears every message and moves focus to the Bill field.
- The page works at 320 px wide and with the keyboard alone.

### Tests
- The tests should be a real strength, not a small suite.
- Unit tests for each acceptance criterion.
- Invariant tests with a seeded random generator. They print the seed when one fails, and the SEED environment variable replays it, as in `SEED=12345 npm test`.
- A test for every on-screen message.
- A test that fails if the docs and the code drift apart.
- Page-file tests read index.html, styles.css and app.js as text. They check the script order, that nothing is loaded from outside, that app.js holds no message text or money logic, and that every id, label and live box is in place.
- All of it runs with a plain `npm test` (which runs `node --test`). Nothing to install.

### Docs and status
- Statuses follow the evidence. A criterion changes only if the criterion itself was wrong, and you tell me first. Never weaken a criterion to make it pass.
- Criteria that depend on the page itself (live updating, messages appearing and disappearing, Reset, the first open) sit in a manual list in the docs-sync test. They need a browser check that I confirmed.
- A page-dependent criterion counts as passed only when I confirmed it in every browser the README lists. The README lists only browsers I actually tested.
- A story that isn't Implemented gets a one-line status note naming the criteria that have no evidence.
- Check each criterion's own numbers against the default of 2 people. The leftover note shows for every total with an odd number of cents, so write "no error message", not "no message", unless the total divides evenly.
- docs/test-report.md has: how to run the tests; the last run with real counts; the browsers tested (name, version, operating system, date, checks, who ran them); one row per criterion (how it was verified, and pass, fail, not confirmed or not built); and a list of what is not covered. Only what is true goes in.

### README
- It describes only what exists and works.
- No badges and no screenshots.
- It says which commands were actually run, and on which system.
- Ask me for the model name. Don't guess it.
