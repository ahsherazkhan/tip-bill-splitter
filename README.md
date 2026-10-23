# Tip and Bill Splitter

A web page that splits a restaurant bill equally, adds a tip and shows what each person owes. It is plain HTML, CSS and JavaScript: no build step, no dependencies and no network use. This is a take-home assignment for a Product Engineering role.

## What it is, who it is for, and why

You enter the bill, a tip percentage (15 to start) and the number of people (2 to start). As you type, the page shows the tip, the total and what each person pays. When the total cannot be split into equal cents, it says how the extra cents are shared. Reset starts again.

It is for one role, the Table Payer: a person at a restaurant table who settles the whole bill and then has to collect each person's share. The group has agreed to split equally, and any shortfall comes out of the payer's own pocket ([docs/app-roles.md](docs/app-roles.md)).

I chose it because the person, the jobs and the one thing that must never happen are small and clear enough to write down and test. I wanted a small app that fully works and is well specified, not a big one that does not. The jobs ([docs/jobs-to-be-done.md](docs/jobs-to-be-done.md)) are:

- J-1 Tell everyone what they owe.
- J-2 Settle on a tip.
- J-3 Share out the odd cents.
- J-4 Redo the sums when things change.
- J-5 Pay in cash without waiting for change. Not served in this version.

The one thing that must never happen is showing a wrong or out-of-date amount: shares that do not add up exactly to the total, or an old result still on screen after an entry became unusable.

## Prerequisites

- A current web browser, to run the app. Only Chrome and Safari were tested (see [Browsers tested](#browsers-tested)).
- Node.js 20 or newer, only to run the tests. The tests were run on Node v24.21.0 (npm 11.19.0). They were not run on Node 20.

## Commands

No install step. The project has no dependencies, so there is no `npm install`.

Open the app:

- macOS: double-click `src/index.html`, or run `open src/index.html`.
- Windows: double-click `src\index.html`, or run `start src\index.html` in Command Prompt or PowerShell.
- Linux: double-click `src/index.html` in the file manager, or run `xdg-open src/index.html`.

Run the tests:

```bash
npm test
```

The invariant tests use random cases from a seed. Without a seed they use seed 1, so every run gives the same result. To use another seed, set `SEED` to a whole number from 0 to 4294967295. A failing random test prints the seed it used.

macOS or Linux:

```bash
SEED=12345 npm test
```

Windows Command Prompt:

```bat
set SEED=12345
npm test
```

Windows PowerShell:

```powershell
$env:SEED = "12345"
npm test
```

In Command Prompt and PowerShell the variable stays set in that window. Clear it with `set SEED=` or `Remove-Item Env:SEED`.

### Commands that were run

On macOS 15.7.5 (zsh) on 2026-10-23, with Node v24.21.0 and npm 11.19.0:

- `npm test`: 125 tests, 125 passed, 0 failed.
- `SEED=12345 npm test`: 125 tests, 125 passed, 0 failed.

I also opened `src/index.html` by double-clicking it on macOS, in Chrome and Safari. No other command above was run: not `open`, `start` or `xdg-open`, and nothing at all on Windows or Linux.

## Testing

The 125 tests are in six files and run with `npm test`. Nothing needs installing.

- **Unit tests for each acceptance criterion** (`tests/stories.test.js`, `tests/edge-cases.test.js`). Test names start with the criterion id, such as `S-3.1`.
- **Invariant tests with seeded random cases** (`tests/invariants.test.js`). For example, the shares always add up exactly to the total and differ by at most 1 cent.
- **Message tests** (`tests/messages.test.js`). One for every message the page can show.
- **Docs-sync tests**, DOCS-1 to DOCS-12 (`tests/docs.test.js`). They fail if the docs and the code drift apart: every message is quoted in the stories doc and the other way round, every criterion has a test or is on the list checked by hand or on the not-built list, the limits match, and each story status matches the test report.
- **PAGE- tests**, PAGE-1 to PAGE-16 (`tests/page.test.js`). PAGE-1 to PAGE-8 read `index.html`, `styles.css` and `app.js` as text. PAGE-9 to PAGE-16 run `app.js` against a small stand-in for the page.

To check that the tests can fail, bugs were planted one at a time in throwaway copies outside the project, for example rounding the tip down instead of half-up, or giving the extra cents to the last people. Where a planted bug was not caught, a test was added until it was.

**Only checked by hand.** The automated tests never load the page in a browser. Eleven criteria depend on the page itself, so they count as passed only because I checked them by hand in Chrome and Safari: S-1.1 (the first open), S-4.15 (a message sits under its entry), S-5.1 to S-5.6 (the amounts follow every change) and S-6.1 to S-6.3 (Reset). A few other checks, such as the 320 px width and keyboard-only use, were not recorded, so they are not confirmed.

The results for every criterion, and what is not covered, are in [docs/test-report.md](docs/test-report.md).

## What is implemented

A story is Implemented only when every one of its criteria passed, by an automated test or by a manual check I confirmed. The stories and their criteria are in [docs/user-stories.md](docs/user-stories.md).

Implemented:

- S-1 See what everyone owes
- S-2 Set the tip
- S-3 Share out the odd cents
- S-4 Get a clear message for an unusable entry
- S-5 Amounts follow every change
- S-6 Start again

Not implemented, left for a later version, with no code behind them:

- S-7 Round the total up (the job J-5)
- S-8 Pick a quick tip

Out of scope: adding tax separately, and splitting by items.

## AI tool and model

Built with Claude Code (desktop app) using Claude Sonnet 5.5 (`claude-sonnet-5-5`). Claude Code wrote the code, tests and docs from my prompts. I reviewed everything and did the browser testing myself. `CLAUDE.md` holds the working rules it followed.

I prepared the prompt plan and the starting `CLAUDE.md` with Claude in a planning chat. That chat's transcript is not included.

## Code changed by hand

None.

## Assumptions

- **The number of people includes the payer**, who also owes a share. The page does not say so.
- **The bill is the amount on the check**, with any tax or service charge already in it. The tip is added on top. There is no separate tax entry.
- **The tip is worked out on the bill as entered**: the percentage times the bill, rounded half-up to the cent, once. The total is the bill plus the tip. For example, a bill of 1.05 at 10% is 0.105, which shows as 0.11. A calculator that uses floating point can show 0.10. The page does not say it rounds half-up.
- **Equal split only.** When the total does not divide evenly, the leftover cents go one each to the first people, meaning the first places in the numbered list. People are not named, so who gets the extra cent does not matter. The result says so, and the shares add up exactly to the total.
- **Currency-neutral display.** Amounts have two decimals, with no currency symbol and no thousands separators, so what you read is what you can type, for example `2000000.00`. This assumes a currency with two decimal places.
- **Limits.** Bill 0.01 to 1000000.00. Tip 0 to 100, with up to two decimals. People 1 to 50, as a whole number. Anything else gets a message and no result. A bill of 0.01 split three ways is allowed and shows 0.01, 0.00 and 0.00.
- **Input rules.**
  - Bill and Tip %: digits and at most one decimal point, up to two decimals. ".5" and "5." are fine. "." on its own is not.
  - People: digits only, so "2.5", "2.0" and "2." are rejected.
  - Leading zeros are fine: "007" is 7.
  - Spaces, tabs and non-breaking spaces at the ends are ignored. Other blank characters, and any blank inside a number, are rejected.
  - Commas, signs, exponents, letters and digits from other scripts are rejected.
  - Only a decimal point is accepted as the decimal mark. I have not checked whether a phone keypad in a region that uses a comma offers a point.
  - If a value has too many decimals and is also out of range, the message about decimals is shown.
  - An empty Bill is not an error: there is just no result yet. An empty Tip % or People gets its own message.
- **Messages follow every keystroke**, so a message can show briefly while a number is half typed. For example, typing 0 on the way to 0.50 shows "The bill must be at least 0.01." until the next digit.
- **English only.** The page stores nothing and sends nothing.

## Browsers tested

| Browser | Version | Operating system | Date |
| --- | --- | --- | --- |
| Google Chrome | 156.0.8078.48 | macOS 15.7.5 | 2026-10-23 |
| Safari | 18.6 | macOS 15.7.5 | 2026-10-23 |

Tested by me, and only these two. In both browsers I opened the page by double-clicking `src/index.html` (a `file://` open) and typed the entries by hand. The checks and results are in [docs/test-report.md](docs/test-report.md).

## Project layout

```
CLAUDE.md          working rules for Claude Code
README.md          this file
package.json       the test script and the Node version; no dependencies
.gitignore
docs/
  app-roles.md
  jobs-to-be-done.md
  user-stories.md
  test-report.md
src/               the app
  index.html       the page
  styles.css
  app.js           reads the entries, calls the view-model and writes the page
  viewmodel.js     raw entries in, everything the page shows out
  calc.js          validation, tip, split and formatting, in whole cents
  messages.js      every message the page can show
tests/             the node:test files that npm test runs
transcripts/       the transcripts of the Claude Code sessions
```

The four scripts in `src/` are plain scripts, not modules. The three logic files also load in Node through `require()`, which is how the tests reach them.
