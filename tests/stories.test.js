const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULTS, viewModel, resetState } = require('../src/viewmodel.js');

const NINES = '9'.repeat(400);
const ARABIC_THREE = '٣';

const BILL_INVALID = 'Enter the bill using only digits and a decimal point, like 42.50.';
const BILL_DECIMALS = 'The bill can have at most 2 decimal places.';
const BILL_MIN = 'The bill must be at least 0.01.';
const BILL_MAX = 'The bill cannot be more than 1000000.00.';
const TIP_EMPTY = 'Enter a tip percentage. Use 0 for no tip.';
const TIP_INVALID = 'Enter the tip using only digits and a decimal point, like 15 or 12.5.';
const TIP_DECIMALS = 'The tip can have at most 2 decimal places.';
const TIP_MAX = 'The tip cannot be more than 100%.';
const PEOPLE_EMPTY = 'Enter the number of people.';
const PEOPLE_INVALID = 'Enter the number of people as a whole number, like 4.';
const PEOPLE_MIN = 'There must be at least 1 person.';
const PEOPLE_MAX = 'There can be at most 50 people.';
const FIRST_PERSON_MORE = 'The total does not divide evenly. The first person pays 1 cent more.';
const FIRST_TWO_MORE = 'The total does not divide evenly. The first 2 people pay 1 cent more.';
const FIRST_FORTY_NINE_MORE = 'The total does not divide evenly. The first 49 people pay 1 cent more.';

const NO_MESSAGES = {
  bill: { invalid: false, message: '' },
  tip: { invalid: false, message: '' },
  people: { invalid: false, message: '' }
};

function show(bill, tip, people) {
  return viewModel({ bill, tip, people });
}

function same(text, times) {
  return new Array(times).fill(text);
}

function assertNoMessages(view) {
  assert.deepEqual(view.fields, NO_MESSAGES);
}

function assertAmounts(view, tip, total, shares, note = '') {
  assertNoMessages(view);
  assert.deepEqual(view.result, { tip, total, shares, note });
}

function assertOnlyMessage(view, field, message, label) {
  for (const name of ['bill', 'tip', 'people']) {
    const expected = name === field ? { invalid: true, message } : { invalid: false, message: '' };
    assert.deepEqual(view.fields[name], expected, `${name} for ${label}`);
  }
  assert.equal(view.result, null, `result for ${label}`);
}

// S-1

test('S-1.1 (support) the opening values give no message and no result', () => {
  const state = resetState();
  assert.deepEqual(state.values, { bill: '', tip: '15', people: '2' });
  assertNoMessages(state.view);
  assert.equal(state.view.result, null);
});

test('S-1.2 bill 100, tip 15, 2 people: tip 15.00, total 115.00, shares 57.50 and 57.50', () => {
  assertAmounts(show('100', '15', '2'), '15.00', '115.00', ['57.50', '57.50']);
});

test('S-1.3 bill 60, tip 10, 1 person: tip 6.00, total 66.00, one share of 66.00', () => {
  assertAmounts(show('60', '10', '1'), '6.00', '66.00', ['66.00']);
});

test('S-1.4 smallest bill 0.01, tip 0, 1 person: tip 0.00, total 0.01, one share of 0.01', () => {
  assertAmounts(show('0.01', '0', '1'), '0.00', '0.01', ['0.01']);
});

test('S-1.5 largest bill, tip and headcount: tip 1000000.00, total 2000000.00, fifty shares of 40000.00', () => {
  assertAmounts(show('1000000.00', '100', '50'), '1000000.00', '2000000.00', same('40000.00', 50));
});

test('S-1.6 Bill spelled .5, 5., 007 or 42.50 with blanks gives no message and tips 0.08, 0.75, 1.05 and 6.38', () => {
  const rows = [
    ['.5', '0.08'], ['5.', '0.75'], ['007', '1.05'],
    ['  42.50  ', '6.38'], ['\t42.50 ', '6.38'], ['  42.50\t', '6.38']
  ];
  for (const [bill, tip] of rows) {
    const view = show(bill, '15', '1');
    assertNoMessages(view);
    assert.equal(view.result.tip, tip, `bill ${JSON.stringify(bill)}`);
    assert.equal(view.result.note, '');
  }
});

test('S-1.7 Tip % spelled .5, 5. or 0015.00 gives no message and tips 0.50, 5.00 and 15.00', () => {
  for (const [tip, amount] of [['.5', '0.50'], ['5.', '5.00'], ['0015.00', '15.00']]) {
    const view = show('100', tip, '1');
    assertNoMessages(view);
    assert.equal(view.result.tip, amount, `tip ${JSON.stringify(tip)}`);
    assert.equal(view.result.note, '');
  }
});

test('S-1.8 People spelled 04 or 4 with blanks gives no message and four shares of 28.75', () => {
  for (const people of ['04', '4', '  4  ', '\t4 ']) {
    assertAmounts(show('100', '15', people), '15.00', '115.00', same('28.75', 4));
  }
});

// S-2

test('S-2.1 changing Tip % from 15 to 20 on a bill of 100 for 2 people: tip 20.00, total 120.00, shares 60.00 and 60.00', () => {
  assertAmounts(show('100', '15', '2'), '15.00', '115.00', ['57.50', '57.50']);
  assertAmounts(show('100', '20', '2'), '20.00', '120.00', ['60.00', '60.00']);
});

test('S-2.2 Tip % 0 on a bill of 100 for 2 people: tip 0.00, total 100.00, shares 50.00 and 50.00', () => {
  assertAmounts(show('100', '0', '2'), '0.00', '100.00', ['50.00', '50.00']);
});

test('S-2.3 Tip % 12.5 on a bill of 100 for 2 people: tip 12.50, total 112.50, shares 56.25 and 56.25', () => {
  assertAmounts(show('100', '12.5', '2'), '12.50', '112.50', ['56.25', '56.25']);
});

test('S-2.4 Tip % 7.25 on a bill of 200 for 2 people: tip 14.50, total 214.50, shares 107.25 and 107.25', () => {
  assertAmounts(show('200', '7.25', '2'), '14.50', '214.50', ['107.25', '107.25']);
});

test('S-2.5 bill 0.30 at 15% for 1 person: tip 0.05 (0.045 rounded half-up), total 0.35', () => {
  assertAmounts(show('0.30', '15', '1'), '0.05', '0.35', ['0.35']);
});

test('S-2.6 bill 10.01 gives tip 1.50 and changing Bill to 10.05 gives tip 1.51 at 15% for 1 person', () => {
  assertAmounts(show('10.01', '15', '1'), '1.50', '11.51', ['11.51']);
  assertAmounts(show('10.05', '15', '1'), '1.51', '11.56', ['11.56']);
});

// S-3

test('S-3.1 bill 100, no tip, 3 people: shares 33.34, 33.33 and 33.33 and the one-person note', () => {
  assertAmounts(show('100', '0', '3'), '0.00', '100.00', ['33.34', '33.33', '33.33'], FIRST_PERSON_MORE);
});

test('S-3.2 bill 42.50, tip 18, 3 people: tip 7.65, total 50.15, shares 16.72, 16.72 and 16.71 and the two-people note', () => {
  assertAmounts(show('42.50', '18', '3'), '7.65', '50.15', ['16.72', '16.72', '16.71'], FIRST_TWO_MORE);
});

test('S-3.3 bill 90, no tip, 3 people: three shares of 30.00 and no note', () => {
  assertAmounts(show('90', '0', '3'), '0.00', '90.00', same('30.00', 3), '');
});

test('S-3.4 bill 0.01, tip 15, 3 people: shares 0.01, 0.00 and 0.00 and the one-person note', () => {
  assertAmounts(show('0.01', '15', '3'), '0.00', '0.01', ['0.01', '0.00', '0.00'], FIRST_PERSON_MORE);
});

test('S-3.5 bill 0.49, no tip, 50 people: forty-nine shares of 0.01 then 0.00 and the 49-people note', () => {
  assertAmounts(show('0.49', '0', '50'), '0.00', '0.49', [...same('0.01', 49), '0.00'], FIRST_FORTY_NINE_MORE);
});

test('S-3.7 bill 100.00, tip 18, 3 people: tip 18.00, total 118.00, shares 39.34, 39.33 and 39.33 and the one-person note', () => {
  assertAmounts(show('100.00', '18', '3'), '18.00', '118.00', ['39.34', '39.33', '39.33'], FIRST_PERSON_MORE);
});

// S-4

test('S-4.1 Bill that is not digits with at most one decimal point shows the invalid message and no result', () => {
  for (const bill of ['abc', '1,5', '-5', '+5', '1e3', '4 2', '.', '1.2.3', ARABIC_THREE]) {
    assertOnlyMessage(show(bill, '15', '2'), 'bill', BILL_INVALID, JSON.stringify(bill));
  }
});

test('S-4.2 Bill with more than two decimals shows the decimals message, also when it is out of range', () => {
  for (const bill of ['10.005', '0.005', '1000000.001']) {
    assertOnlyMessage(show(bill, '15', '2'), 'bill', BILL_DECIMALS, JSON.stringify(bill));
  }
});

test('S-4.3 Bill of 0, 0.00 or 0. shows the minimum message and no result', () => {
  for (const bill of ['0', '0.00', '0.']) {
    assertOnlyMessage(show(bill, '15', '2'), 'bill', BILL_MIN, JSON.stringify(bill));
  }
});

test('S-4.4 Bill of 1000000.01 or 400 digits shows the maximum message and no result', () => {
  for (const bill of ['1000000.01', NINES]) {
    assertOnlyMessage(show(bill, '15', '2'), 'bill', BILL_MAX, bill.slice(0, 12));
  }
});

test('S-4.5 empty Tip % or only spaces shows the empty message and no result', () => {
  for (const tip of ['', '   ']) {
    assertOnlyMessage(show('100', tip, '2'), 'tip', TIP_EMPTY, JSON.stringify(tip));
  }
});

test('S-4.6 Tip % that is not digits with at most one decimal point shows the invalid message and no result', () => {
  for (const tip of ['abc', '1,5', '-5', '1e1', '.', ARABIC_THREE]) {
    assertOnlyMessage(show('100', tip, '2'), 'tip', TIP_INVALID, JSON.stringify(tip));
  }
});

test('S-4.7 Tip % with more than two decimals shows the decimals message, also when it is above the maximum', () => {
  for (const tip of ['12.505', '100.001']) {
    assertOnlyMessage(show('100', tip, '2'), 'tip', TIP_DECIMALS, JSON.stringify(tip));
  }
});

test('S-4.8 Tip % of 100.01, 101 or 400 digits shows the maximum message and no result', () => {
  for (const tip of ['100.01', '101', NINES]) {
    assertOnlyMessage(show('100', tip, '2'), 'tip', TIP_MAX, tip.slice(0, 12));
  }
});

test('S-4.9 empty People or only spaces shows the empty message and no result', () => {
  for (const people of ['', '  ']) {
    assertOnlyMessage(show('100', '15', people), 'people', PEOPLE_EMPTY, JSON.stringify(people));
  }
});

test('S-4.10 People that is not a whole number written with digits shows the invalid message and no result', () => {
  for (const people of ['2.5', '2.0', '2.', 'abc', '-1', '1e1', ARABIC_THREE]) {
    assertOnlyMessage(show('100', '15', people), 'people', PEOPLE_INVALID, JSON.stringify(people));
  }
});

test('S-4.11 People of 0 or 00 shows the minimum message and no result', () => {
  for (const people of ['0', '00']) {
    assertOnlyMessage(show('100', '15', people), 'people', PEOPLE_MIN, JSON.stringify(people));
  }
});

test('S-4.12 People of 51 or 400 digits shows the maximum message and no result', () => {
  for (const people of ['51', NINES]) {
    assertOnlyMessage(show('100', '15', people), 'people', PEOPLE_MAX, people.slice(0, 12));
  }
});

test('S-4.13 empty Bill or only spaces is not an error: no message and no result', () => {
  for (const bill of ['', '   ']) {
    const view = show(bill, '15', '2');
    assertNoMessages(view);
    assert.equal(view.result, null);
  }
});

test('S-4.14 Bill abc, empty Tip % and People 0 each show their own message and no result', () => {
  const view = show('abc', '', '0');
  assert.deepEqual(view.fields, {
    bill: { invalid: true, message: BILL_INVALID },
    tip: { invalid: true, message: TIP_EMPTY },
    people: { invalid: true, message: PEOPLE_MIN }
  });
  assert.equal(view.result, null);
});

// S-5 (the page part is checked by hand; these cover what the view-model returns for the changed entries)

test('S-5.1 (support) changing People from 2 to 4 re-splits the same total of 115.00', () => {
  assertAmounts(show('100', '15', '2'), '15.00', '115.00', ['57.50', '57.50']);
  assertAmounts(show('100', '15', '4'), '15.00', '115.00', same('28.75', 4));
});

test('S-5.2 (support) changing Tip % to abc removes the result and shows the invalid message', () => {
  assertAmounts(show('100', '15', '2'), '15.00', '115.00', ['57.50', '57.50']);
  assertOnlyMessage(show('100', 'abc', '2'), 'tip', TIP_INVALID, 'abc');
});

test('S-5.3 (support) changing Tip % from abc to 18 removes the message and shows the result', () => {
  assertOnlyMessage(show('100', 'abc', '2'), 'tip', TIP_INVALID, 'abc');
  assertAmounts(show('100', '18', '2'), '18.00', '118.00', ['59.00', '59.00']);
});

test('S-5.4 (support) deleting the Bill removes the result and shows no error message', () => {
  assertAmounts(show('100', '15', '2'), '15.00', '115.00', ['57.50', '57.50']);
  const view = show('', '15', '2');
  assertNoMessages(view);
  assert.equal(view.result, null);
});

test('S-5.5 (support) clearing Tip % removes the result and shows the empty message', () => {
  assertAmounts(show('100', '15', '2'), '15.00', '115.00', ['57.50', '57.50']);
  assertOnlyMessage(show('100', '', '2'), 'tip', TIP_EMPTY, 'empty');
});

test('S-5.6 (support) typing 1, 12 and 125 into Bill gives tips 0.15, 1.80, 18.75 and totals 1.15, 13.80, 143.75', () => {
  for (const [bill, tip, total] of [['1', '0.15', '1.15'], ['12', '1.80', '13.80'], ['125', '18.75', '143.75']]) {
    assertAmounts(show(bill, '15', '1'), tip, total, [total]);
  }
});

// S-6 (the page part is checked by hand)

test('S-6.1 (support) the state for Reset has Bill empty, Tip % 15, People 2 and no result', () => {
  const state = resetState();
  assert.deepEqual(state.values, { bill: '', tip: '15', people: '2' });
  assert.equal(state.view.result, null);
});

test('S-6.2 (support) the state for Reset shows no message under Bill, Tip % or People', () => {
  show('abc', '', '0');
  assertNoMessages(resetState().view);
});

test('S-6.4 the state after Reset is the opening state: Bill empty, Tip % 15, People 2, no message, no result', () => {
  const state = resetState();
  assert.deepEqual(state.values, { bill: '', tip: '15', people: '2' });
  assert.deepEqual(state.view, viewModel(DEFAULTS));
  assertNoMessages(state.view);
  assert.equal(state.view.result, null);
  viewModel({ bill: 'abc', tip: '', people: '0' });
  assert.deepEqual(resetState(), state);
});
