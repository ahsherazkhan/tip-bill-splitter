# User Stories

Every story serves one job from the jobs document. A story is Implemented only when every one of its criteria has passed. Otherwise it is Not implemented, and a note names the criteria that have no evidence yet.

How to read the criteria:
- Bill, Tip % and People are the three entries. The page opens with Bill empty, Tip % showing 15 and People showing 2.
- Bill and Tip % take at least one digit and at most one decimal point. People takes digits only. Spaces, tabs and non-breaking spaces around an entry are ignored.
- The result has the tip amount (labelled Tip), the total (labelled Total, the bill plus the tip) and Each person pays, a numbered list with one amount per person. When the total does not divide evenly, a note about the extra cents appears in the result.
- Amounts have two decimals, with no currency symbol and no thousands separators.
- Messages are quoted exactly as the page shows them. In a criterion about one entry, the other two entries are valid, so only that entry shows a message.

## S-1 (serves J-1, Not implemented): See what everyone owes

As a Table Payer, I want to enter the bill, the tip and the number of people and see the tip, the total and what each person pays, so that I can ask each person for the right amount straight away.

Status note: no evidence yet for S-1.1 to S-1.8.

Acceptance criteria:
- S-1.1 Given I open the page, when it has loaded, then Bill is empty, Tip % shows 15, People shows 2, and there is no error message and no result.
- S-1.2 Given Tip % is 15 and People is 2, when I enter 100 in Bill, then the tip amount is 15.00, the total is 115.00 and Each person pays lists 57.50 and 57.50.
- S-1.3 Given Tip % is 10 and People is 1, when I enter 60 in Bill, then the tip amount is 6.00, the total is 66.00 and Each person pays lists one amount, 66.00.
- S-1.4 Given Tip % is 0 and People is 1, when I enter 0.01 in Bill (the smallest bill), then the tip amount is 0.00, the total is 0.01 and Each person pays lists one amount, 0.01.
- S-1.5 Given Tip % is 100 and People is 50, when I enter 1000000.00 in Bill (the largest bill), then the tip amount is 1000000.00, the total is 2000000.00 and Each person pays lists 40000.00 fifty times.
- S-1.6 Given Tip % is 15 and People is 1, when I enter Bill as ".5", "5.", "007" or "42.50" with spaces, tabs or non-breaking spaces around it, then there is no error message and the tip amount is 0.08, 0.75, 1.05 and 6.38 respectively.
- S-1.7 Given Bill is 100 and People is 1, when I enter Tip % as ".5", "5." or "0015.00", then there is no error message and the tip amount is 0.50, 5.00 and 15.00 respectively.
- S-1.8 Given Bill is 100 and Tip % is 15, when I enter People as "04" or "4" with spaces, tabs or non-breaking spaces around it, then there is no error message and Each person pays lists 28.75 four times.

## S-2 (serves J-2, Not implemented): Set the tip

As a Table Payer, I want to set the tip as a percentage and see what it comes to in money, so that I can agree on a tip that feels fair without guessing.

Status note: no evidence yet for S-2.1 to S-2.6.

Acceptance criteria:
- S-2.1 Given Bill is 100 and People is 2, when I change Tip % from 15 to 20, then the tip amount is 20.00, the total is 120.00 and Each person pays lists 60.00 and 60.00.
- S-2.2 Given Bill is 100 and People is 2, when I enter 0 in Tip % (no tip), then the tip amount is 0.00, the total is 100.00 and Each person pays lists 50.00 and 50.00.
- S-2.3 Given Bill is 100 and People is 2, when I enter 12.5 in Tip %, then the tip amount is 12.50, the total is 112.50 and Each person pays lists 56.25 and 56.25.
- S-2.4 Given Bill is 200 and People is 2, when I enter 7.25 in Tip % (two decimals), then the tip amount is 14.50, the total is 214.50 and Each person pays lists 107.25 and 107.25.
- S-2.5 Given Tip % is 15 and People is 1, when I enter 0.30 in Bill, then the tip amount is 0.05 (0.045 rounded half-up) and the total is 0.35.
- S-2.6 Given Tip % is 15 and People is 1, when I enter 10.01 in Bill, then the tip amount is 1.50, and when I change Bill to 10.05, then the tip amount is 1.51.

## S-3 (serves J-3, Not implemented): Share out the odd cents

As a Table Payer, I want to be told how the extra cents are shared out when the total does not divide evenly, so that what I collect adds up exactly to what I paid.

Status note: no evidence yet for S-3.1 to S-3.7.

Acceptance criteria:
- S-3.1 Given Tip % is 0 and People is 3, when I enter 100 in Bill, then the total is 100.00, Each person pays lists 33.34, 33.33 and 33.33, and the note "The total does not divide evenly. The first person pays 1 cent more." is shown.
- S-3.2 Given Tip % is 18 and People is 3, when I enter 42.50 in Bill, then the tip amount is 7.65, the total is 50.15, Each person pays lists 16.72, 16.72 and 16.71, and the note "The total does not divide evenly. The first 2 people pay 1 cent more." is shown.
- S-3.3 Given Tip % is 0 and People is 3, when I enter 90 in Bill, then Each person pays lists 30.00 three times and no note about extra cents is shown.
- S-3.4 Given Tip % is 15 and People is 3, when I enter 0.01 in Bill, then the tip amount is 0.00, the total is 0.01, Each person pays lists 0.01, 0.00 and 0.00, and the note "The total does not divide evenly. The first person pays 1 cent more." is shown.
- S-3.5 Given Tip % is 0 and People is 50, when I enter 0.49 in Bill, then Each person pays lists 0.01 forty-nine times followed by 0.00, and the note "The total does not divide evenly. The first 49 people pay 1 cent more." is shown.
- S-3.6 Given any valid Bill, Tip % and People, when I enter them, then the amounts in Each person pays add up exactly to the total, no two of them differ by more than 1 cent, and the larger amounts come first.
- S-3.7 Given Tip % is 18 and People is 3, when I enter 100.00 in Bill, then the tip amount is 18.00, the total is 118.00, Each person pays lists 39.34, 39.33 and 39.33, and the note "The total does not divide evenly. The first person pays 1 cent more." is shown.

## S-4 (serves J-4, Not implemented): Get a clear message for an unusable entry

As a Table Payer, I want a clear message under any entry that cannot be used, so that I can correct the figure and never act on an amount built from a wrong one.

Status note: no evidence yet for S-4.1 to S-4.16.

Acceptance criteria:
- S-4.1 Given Tip % is 15 and People is 2, when Bill is not a number written with digits and at most one decimal point, such as "abc", "1,5", "-5", "+5", "1e3", "4 2", ".", "1.2.3" or "٣", then "Enter the bill using only digits and a decimal point, like 42.50." appears under Bill and there is no result.
- S-4.2 Given Tip % is 15 and People is 2, when Bill has more than two decimals, such as "10.005", then "The bill can have at most 2 decimal places." appears under Bill and there is no result; the same message appears, rather than a range message, for "0.005" and "1000000.001", which are also out of range.
- S-4.3 Given Tip % is 15 and People is 2, when Bill is "0", "0.00" or "0.", then "The bill must be at least 0.01." appears under Bill and there is no result.
- S-4.4 Given Tip % is 15 and People is 2, when Bill is "1000000.01" or a number with 400 digits, then "The bill cannot be more than 1000000.00." appears under Bill and there is no result.
- S-4.5 Given Bill is 100 and People is 2, when Tip % is empty or only spaces, then "Enter a tip percentage. Use 0 for no tip." appears under Tip % and there is no result.
- S-4.6 Given Bill is 100 and People is 2, when Tip % is not a number written with digits and at most one decimal point, such as "abc", "1,5", "-5", "1e1", "." or "٣", then "Enter the tip using only digits and a decimal point, like 15 or 12.5." appears under Tip % and there is no result.
- S-4.7 Given Bill is 100 and People is 2, when Tip % has more than two decimals, such as "12.505", then "The tip can have at most 2 decimal places." appears under Tip % and there is no result; the same message appears, rather than "The tip cannot be more than 100%.", for "100.001", which is also above the maximum.
- S-4.8 Given Bill is 100 and People is 2, when Tip % is "100.01", "101" or a number with 400 digits, then "The tip cannot be more than 100%." appears under Tip % and there is no result.
- S-4.9 Given Bill is 100 and Tip % is 15, when People is empty or only spaces, then "Enter the number of people." appears under People and there is no result.
- S-4.10 Given Bill is 100 and Tip % is 15, when People is not a whole number written with digits only, such as "2.5", "2.0", "2.", "abc", "-1", "1e1" or "٣", then "Enter the number of people as a whole number, like 4." appears under People and there is no result.
- S-4.11 Given Bill is 100 and Tip % is 15, when People is "0" or "00", then "There must be at least 1 person." appears under People and there is no result.
- S-4.12 Given Bill is 100 and Tip % is 15, when People is "51" or a number with 400 digits, then "There can be at most 50 people." appears under People and there is no result.
- S-4.13 Given Tip % is 15 and People is 2, when Bill is empty or only spaces, then there is no error message and no result.
- S-4.14 Given Tip % is empty and People is "0", when I enter "abc" in Bill, then each entry shows its own message under it ("Enter the bill using only digits and a decimal point, like 42.50.", "Enter a tip percentage. Use 0 for no tip." and "There must be at least 1 person.") and there is no result.
- S-4.15 Given an entry cannot be used, when its message appears, then the message is directly under that entry and no other entry, inside a box marked aria-live="polite" that the entry is linked to with aria-describedby.
- S-4.16 Given any text in Bill, Tip % and People, including very long text, when I enter it, then no message, amount or note that the page produces contains NaN, Infinity, undefined or exponent notation.

## S-5 (serves J-4, Not implemented): Amounts follow every change

As a Table Payer, I want the amounts to follow every change I make, so that I never read out a figure that no longer matches what I entered.

Status note: no evidence yet for S-5.1 to S-5.7.

Acceptance criteria:
- S-5.1 Given a result is showing for Bill 100, Tip % 15 and People 2, when I change People to 4, then the total stays 115.00 and Each person pays lists 28.75 four times in place of 57.50 twice.
- S-5.2 Given a result is showing for Bill 100, Tip % 15 and People 2, when I change Tip % to "abc", then the result disappears, "Enter the tip using only digits and a decimal point, like 15 or 12.5." appears under Tip %, and no amount from before is left on the page.
- S-5.3 Given Bill is 100, People is 2 and Tip % is "abc" with its message showing, when I change Tip % to 18, then the message disappears and the result is shown: the tip amount is 18.00, the total is 118.00 and Each person pays lists 59.00 and 59.00.
- S-5.4 Given a result is showing, when I delete the Bill, then the result disappears and there is no error message.
- S-5.5 Given a result is showing, when I clear Tip %, then the result disappears and "Enter a tip percentage. Use 0 for no tip." appears under Tip %.
- S-5.6 Given Tip % is 15, People is 1 and Bill is empty, when I type 1, then 2, then 5 into Bill, then after each character the tip amount and total are 0.15 and 1.15, then 1.80 and 13.80, then 18.75 and 143.75, without my pressing anything.
- S-5.7 Given any Bill, Tip % and People, when I enter them, then the page never shows a result and an error message at the same time.

## S-6 (serves J-4, Not implemented): Start again

As a Table Payer, I want to clear everything and start again, so that nothing from the last bill carries over into the next one.

Status note: no evidence yet for S-6.1 to S-6.4.

Acceptance criteria:
- S-6.1 Given I have entered a Bill, changed Tip % to 20 and People to 4, and a result is showing, when I choose Reset, then Bill is empty, Tip % shows 15, People shows 2 and no result is shown.
- S-6.2 Given a message is showing under each of Bill, Tip % and People, when I choose Reset, then every message disappears.
- S-6.3 Given any state of the page, when I choose Reset, then the cursor is in the Bill entry, ready for typing.
- S-6.4 Given any entries, when I choose Reset, then the state is the same as when the page first opens: Bill empty, Tip % 15, People 2, no error message and no result.

## S-7 (serves J-5, Not implemented): Round the total up

As a Table Payer, I want to round the total up to a whole amount, so that I can pay in cash with the notes and coins I have, without waiting for change.

Status note: left for a later version; no evidence for S-7.1 to S-7.2.

Acceptance criteria:
- S-7.1 Given Bill is 41.20, Tip % is 15 and People is 2 (the total is 47.38), when I choose to round the total up, then the total is 48.00 and Each person pays lists 24.00 and 24.00.
- S-7.2 Given Bill is 100, Tip % is 15 and People is 2 (the total is 115.00), when I choose to round the total up, then the total stays 115.00 and Each person pays still lists 57.50 and 57.50.

## S-8 (serves J-2, Not implemented): Pick a quick tip

As a Table Payer, I want to choose a common tip with a single press, so that I can compare tips quickly while the table decides.

Status note: left for a later version; no evidence for S-8.1 to S-8.2.

Acceptance criteria:
- S-8.1 Given Bill is 100 and People is 2, when I press the 20 button, then Tip % shows 20, the tip amount is 20.00, the total is 120.00 and Each person pays lists 60.00 and 60.00.
- S-8.2 Given I pressed the 10 button, when I type 12.5 in Tip %, then the amounts follow 12.5 and no button is shown as chosen.

## Jobs not served in v1

- J-5 (Pay in cash without waiting for change) is served only by S-7, which is Not implemented.

## Out of scope for now

- Adding tax separately. The tip is worked out on the bill as entered. A separate tax entry would change what the tip is based on and needs its own entry, limits and messages.
- Splitting by items. The table has agreed to split equally. Splitting by what each person ordered is a different situation.

## Traceability

| Story | Job | Role |
| --- | --- | --- |
| S-1 | J-1 | Table Payer |
| S-2 | J-2 | Table Payer |
| S-3 | J-3 | Table Payer |
| S-4 | J-4 | Table Payer |
| S-5 | J-4 | Table Payer |
| S-6 | J-4 | Table Payer |
| S-7 | J-5 | Table Payer |
| S-8 | J-2 | Table Payer |
