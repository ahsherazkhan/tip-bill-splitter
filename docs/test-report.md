# Test report

## How to run the tests

From the project folder, with Node 20 or newer. Nothing to install.

```bash
npm test
```

`SEED=12345 npm test` runs the seeded random tests with a different seed. A seeded test that fails prints the seed it used.

## Last run

2026-10-23 on macOS 15.7.5, with Node v24.21.0 and npm 11.19.0: 125 tests ran, 125 passed, 0 failed.

## Browsers tested

I opened the page myself in each browser and typed the entries by hand, as a normal user would.

| Browser | Version | Operating system | Date | Checks | Run by |
| --- | --- | --- | --- | --- | --- |
| Google Chrome | 156.0.8078.48 | macOS 15.7.5 | 2026-10-23 | S-1.1, S-4.15, S-5.1 to S-5.6, S-6.1 to S-6.3 | me |
| Safari | 18.6 | macOS 15.7.5 | 2026-10-23 | S-1.1, S-4.15, S-5.1 to S-5.6, S-6.1 to S-6.3 | me |

All 11 checks passed in both browsers. None failed and none was left untested. These are the only browsers with results in this report.

## Results by criterion

"How verified" is the name of the main automated test for the criterion, or "manual, confirmed by me". Many criteria also have edge-case, message and invariant tests whose names start with the same id. An automated row shows pass because every test in the last run above passed.

The automated tests never load the page. PAGE-1 to PAGE-8 read the page files as text, and PAGE-9 to PAGE-16 run app.js against a stand-in page. A criterion that depends on the page itself is on the manual list and counts only because I confirmed it in both browsers. Those criteria also have automated support tests (the ones named "(support)", PAGE-4 and PAGE-9 to PAGE-16). They do not replace the manual check.

| Criterion | How verified | Result |
| --- | --- | --- |
| S-1.1 | manual, confirmed by me | pass |
| S-1.2 | S-1.2 bill 100, tip 15, 2 people: tip 15.00, total 115.00, shares 57.50 and 57.50 | pass |
| S-1.3 | S-1.3 bill 60, tip 10, 1 person: tip 6.00, total 66.00, one share of 66.00 | pass |
| S-1.4 | S-1.4 smallest bill 0.01, tip 0, 1 person: tip 0.00, total 0.01, one share of 0.01 | pass |
| S-1.5 | S-1.5 largest bill, tip and headcount: tip 1000000.00, total 2000000.00, fifty shares of 40000.00 | pass |
| S-1.6 | S-1.6 Bill spelled .5, 5., 007 or 42.50 with blanks gives no message and tips 0.08, 0.75, 1.05 and 6.38 | pass |
| S-1.7 | S-1.7 Tip % spelled .5, 5. or 0015.00 gives no message and tips 0.50, 5.00 and 15.00 | pass |
| S-1.8 | S-1.8 People spelled 04 or 4 with blanks gives no message and four shares of 28.75 | pass |
| S-2.1 | S-2.1 changing Tip % from 15 to 20 on a bill of 100 for 2 people: tip 20.00, total 120.00, shares 60.00 and 60.00 | pass |
| S-2.2 | S-2.2 Tip % 0 on a bill of 100 for 2 people: tip 0.00, total 100.00, shares 50.00 and 50.00 | pass |
| S-2.3 | S-2.3 Tip % 12.5 on a bill of 100 for 2 people: tip 12.50, total 112.50, shares 56.25 and 56.25 | pass |
| S-2.4 | S-2.4 Tip % 7.25 on a bill of 200 for 2 people: tip 14.50, total 214.50, shares 107.25 and 107.25 | pass |
| S-2.5 | S-2.5 bill 0.30 at 15% for 1 person: tip 0.05 (0.045 rounded half-up), total 0.35 | pass |
| S-2.6 | S-2.6 bill 10.01 gives tip 1.50 and changing Bill to 10.05 gives tip 1.51 at 15% for 1 person | pass |
| S-3.1 | S-3.1 bill 100, no tip, 3 people: shares 33.34, 33.33 and 33.33 and the one-person note | pass |
| S-3.2 | S-3.2 bill 42.50, tip 18, 3 people: tip 7.65, total 50.15, shares 16.72, 16.72 and 16.71 and the two-people note | pass |
| S-3.3 | S-3.3 bill 90, no tip, 3 people: three shares of 30.00 and no note | pass |
| S-3.4 | S-3.4 bill 0.01, tip 15, 3 people: shares 0.01, 0.00 and 0.00 and the one-person note | pass |
| S-3.5 | S-3.5 bill 0.49, no tip, 50 people: forty-nine shares of 0.01 then 0.00 and the 49-people note | pass |
| S-3.6 | S-3.6 invariant: shares add up exactly to the total; S-3.6 invariant: shares differ by at most 1 cent, never increase, and total % people of them are larger | pass |
| S-3.7 | S-3.7 bill 100.00, tip 18, 3 people: tip 18.00, total 118.00, shares 39.34, 39.33 and 39.33 and the one-person note | pass |
| S-4.1 | S-4.1 Bill that is not digits with at most one decimal point shows the invalid message and no result | pass |
| S-4.2 | S-4.2 Bill with more than two decimals shows the decimals message, also when it is out of range | pass |
| S-4.3 | S-4.3 Bill of 0, 0.00 or 0. shows the minimum message and no result | pass |
| S-4.4 | S-4.4 Bill of 1000000.01 or 400 digits shows the maximum message and no result | pass |
| S-4.5 | S-4.5 empty Tip % or only spaces shows the empty message and no result | pass |
| S-4.6 | S-4.6 Tip % that is not digits with at most one decimal point shows the invalid message and no result | pass |
| S-4.7 | S-4.7 Tip % with more than two decimals shows the decimals message, also when it is above the maximum | pass |
| S-4.8 | S-4.8 Tip % of 100.01, 101 or 400 digits shows the maximum message and no result | pass |
| S-4.9 | S-4.9 empty People or only spaces shows the empty message and no result | pass |
| S-4.10 | S-4.10 People that is not a whole number written with digits shows the invalid message and no result | pass |
| S-4.11 | S-4.11 People of 0 or 00 shows the minimum message and no result | pass |
| S-4.12 | S-4.12 People of 51 or 400 digits shows the maximum message and no result | pass |
| S-4.13 | S-4.13 empty Bill or only spaces is not an error: no message and no result | pass |
| S-4.14 | S-4.14 Bill abc, empty Tip % and People 0 each show their own message and no result | pass |
| S-4.15 | manual, confirmed by me | pass |
| S-4.16 | S-4.16 invariant: no message, amount or note contains NaN, Infinity, undefined or exponent notation | pass |
| S-5.1 | manual, confirmed by me | pass |
| S-5.2 | manual, confirmed by me | pass |
| S-5.3 | manual, confirmed by me | pass |
| S-5.4 | manual, confirmed by me | pass |
| S-5.5 | manual, confirmed by me | pass |
| S-5.6 | manual, confirmed by me | pass |
| S-5.7 | S-5.7 invariant: a result and a message never show together, and an empty Bill shows neither | pass |
| S-6.1 | manual, confirmed by me | pass |
| S-6.2 | manual, confirmed by me | pass |
| S-6.3 | manual, confirmed by me | pass |
| S-6.4 | S-6.4 the state after Reset is the opening state: Bill empty, Tip % 15, People 2, no message, no result | pass |
| S-7.1 | none, not built | not built |
| S-7.2 | none, not built | not built |
| S-8.1 | none, not built | not built |
| S-8.2 | none, not built | not built |

## Other checks (not criteria)

I did not record results for these, so none of them is confirmed.

| Check | Result |
| --- | --- |
| The page works at 320 px wide | not confirmed |
| The page works with the keyboard alone | not confirmed |
| Reloading the page brings back the opening values | not confirmed |

## Not covered

- The automated tests never load the page (see above).
- The three checks under "Other checks": 320 px wide, keyboard only and reload.
- How the page was opened in each browser (by double-clicking src/index.html or from a local server) was not recorded.
- Other browsers, browser versions, operating systems, phones, tablets and on-screen keyboards. No results are recorded for them.
- Screen readers. PAGE-4 checks the aria markup as text only. The Result box is not a live region, so a screen reader may not announce changes to it. No story requires that.
- Short phone screens. In a 320 by 568 window with Bill 42.50, Tip % 18 and People 3, the Result box runs from 393 px to 669 px down the page, so the end of the list and the note are off screen until you scroll. Measured in an emulated window in a preview browser, not confirmed in Chrome or Safari. An on-screen keyboard would hide more.
- Large text at 320 px wide. With the root font size set to 32 px (200% text) and Bill 1000000.00, Tip % 100 and People 50, the Tip and Total rows spill out of the page and it scrolls sideways. At 150% it fits. This was simulated by setting the font size in a preview browser, not by an operating system text-size setting, and it is not confirmed in Chrome or Safari.
- Node 20. Only Node 24.21.0 was run.
- Seeded tests. They use one fixed seed unless SEED is set.
- The test suite was run on macOS only.
