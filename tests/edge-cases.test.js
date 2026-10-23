const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  LIMITS,
  validateBill,
  validateTip,
  validatePeople,
  tipCents,
  splitTotal,
  formatCents
} = require('../src/calc.js');
const { viewModel } = require('../src/viewmodel.js');

const BLANK_MIXES = ['', ' ', '  ', '\t', ' ', ' \t ', ' \t '];
const NINES = '9'.repeat(400);
const ZEROS = '0'.repeat(400);

function expectCode(validate, entry, code) {
  const result = validate(entry);
  assert.equal(result.ok ? 'ok' : result.code, code, `entry ${JSON.stringify(entry)}`);
}

function expectValue(validate, entry, value) {
  assert.deepEqual(validate(entry), { ok: true, value }, `entry ${JSON.stringify(entry)}`);
}

function expectAll(validate, entries, code) {
  for (const entry of entries) {
    expectCode(validate, entry, code);
  }
}

function tipFor(bill, tip) {
  return formatCents(tipCents(validateBill(bill).value, validateTip(tip).value));
}

test('S-1.6 edge: any mix of space, tab and non-breaking space around Bill is ignored', () => {
  for (const left of BLANK_MIXES) {
    for (const right of BLANK_MIXES) {
      expectValue(validateBill, left + '42.50' + right, 4250);
    }
  }
});

test('S-1.7 edge: any mix of space, tab and non-breaking space around Tip % is ignored', () => {
  for (const left of BLANK_MIXES) {
    for (const right of BLANK_MIXES) {
      expectValue(validateTip, left + '15' + right, 1500);
    }
  }
});

test('S-1.8 edge: any mix of space, tab and non-breaking space around People is ignored', () => {
  for (const left of BLANK_MIXES) {
    for (const right of BLANK_MIXES) {
      expectValue(validatePeople, left + '4' + right, 4);
    }
  }
});

test('S-4.1 edge: other kinds of blank at the ends are not ignored', () => {
  for (const blank of [' ', '\n', '\r', '\u000b', '​', '﻿', '　']) {
    expectCode(validateBill, blank + '42.50', 'invalid');
    expectCode(validateBill, '42.50' + blank, 'invalid');
    expectCode(validateTip, blank + '15', 'invalid');
    expectCode(validatePeople, '4' + blank, 'invalid');
  }
  expectCode(validateTip, ' ', 'invalid');
});

test('S-4.1 edge: blanks inside a number make it unusable', () => {
  expectAll(validateBill, ['4 2', '4\t2', '4 2', '4. 2', ' 4 2 ', '1 000', '1 .5'], 'invalid');
  expectAll(validateTip, ['1 5', '1\t5', '12 .5'], 'invalid');
  expectAll(validatePeople, ['1 2', '1\t2', '1 2'], 'invalid');
});

test('S-4.1 edge: signs, exponents, prefixes and words are unusable', () => {
  const entries = [
    '+5', '-5', '−5', '1e3', '1E3', '1e+3', '1e-3', '0x10', '0b1', '0o7',
    'NaN', 'Infinity', '-Infinity', 'null', 'undefined', 'true', '1,000', '1,5',
    '$5', '5$', '5%', '(5)', 'abc', '5abc', 'abc5'
  ];
  expectAll(validateBill, entries, 'invalid');
  expectAll(validateTip, entries, 'invalid');
  expectAll(validatePeople, entries, 'invalid');
});

test('S-4.1 edge: digits from other scripts are unusable', () => {
  const entries = ['٣', '٤٥', '１２', '१२', '²', '½', '①', '५.५'];
  expectAll(validateBill, entries, 'invalid');
  expectAll(validateTip, entries, 'invalid');
  expectAll(validatePeople, entries, 'invalid');
});

test('S-4.1 edge: a lone point, two points and a stray point are unusable', () => {
  const entries = ['.', '..', '5..', '1.2.3', '.5.', '. 5', '5 .'];
  expectAll(validateBill, entries, 'invalid');
  expectAll(validateTip, entries, 'invalid');
});

test('S-4.2 edge: three decimals are refused even when they are zeros', () => {
  expectAll(validateBill, ['10.000', '0.000', '5.100', '1000000.000'], 'decimals');
  expectAll(validateTip, ['10.000', '0.000', '5.100'], 'decimals');
});

test('S-4.2 edge: decimals win over the range messages for Bill and Tip %', () => {
  expectAll(validateBill, ['0.005', '0.0049', '1000000.001', '99999999.999'], 'decimals');
  expectAll(validateTip, ['100.001', '100.5555', '0.001'], 'decimals');
});

test('S-4.3 edge: every spelling of zero is below the minimum bill', () => {
  expectAll(validateBill, ['0', '00', '0.0', '.0', '0.', '000.00', '0.00'], 'min');
});

test('S-4.4 edge: Bill limit boundaries', () => {
  const accepted = [
    ['1000000', 100000000], ['1000000.0', 100000000], ['1000000.00', 100000000], ['01000000', 100000000],
    ['999999.99', 99999999], ['0.01', 1], ['00.01', 1], ['.01', 1], ['.5', 50], ['5.', 500], ['007', 700]
  ];
  for (const [entry, cents] of accepted) {
    expectValue(validateBill, entry, cents);
  }
  expectAll(validateBill, ['1000000.01', '1000001', '1000000.1', '10000000', '99999999'], 'max');
});

test('S-4.4 edge: very long digit strings are handled by length, not by value', () => {
  expectCode(validateBill, NINES, 'max');
  expectCode(validateBill, ZEROS, 'min');
  expectCode(validateBill, '1' + ZEROS, 'max');
  expectCode(validateBill, NINES + '.99', 'max');
  expectCode(validateBill, '0.' + ZEROS, 'decimals');
  expectValue(validateBill, '0'.repeat(399) + '1', 100);
  expectValue(validateBill, ZEROS + '.01', 1);
  expectCode(validateTip, NINES, 'max');
  expectValue(validateTip, ZEROS, 0);
  expectCode(validateTip, '0.' + ZEROS, 'decimals');
  expectCode(validatePeople, NINES, 'max');
  expectCode(validatePeople, ZEROS, 'min');
  expectValue(validatePeople, '0'.repeat(399) + '7', 7);
});

test('S-4.5 edge: only blanks counts as empty, and only an empty Bill has no message', () => {
  for (const blanks of ['', ' ', '\t  ']) {
    assert.deepEqual(validateBill(blanks), { ok: false, code: 'empty', message: null });
    assert.deepEqual(validateTip(blanks), { ok: false, code: 'empty', message: 'Enter a tip percentage. Use 0 for no tip.' });
    assert.deepEqual(validatePeople(blanks), { ok: false, code: 'empty', message: 'Enter the number of people.' });
  }
});

test('S-4.8 edge: Tip % limit boundaries', () => {
  const accepted = [
    ['0', 0], ['0.00', 0], ['.01', 1], ['99.99', 9999], ['100', 10000], ['100.0', 10000], ['100.00', 10000],
    ['0100', 10000], ['12.5', 1250], ['7.25', 725], ['.5', 50], ['5.', 500], ['0015.00', 1500]
  ];
  for (const [entry, basisPoints] of accepted) {
    expectValue(validateTip, entry, basisPoints);
  }
  expectAll(validateTip, ['100.01', '100.1', '101', '1000', NINES], 'max');
});

test('S-4.10 edge: People takes digits only', () => {
  const entries = ['+4', '4.', '4.0', '2.5', '４', '٤', '4e0', '0x4', '4 4', '--4', '4,0', '-1', '1e1', 'abc'];
  expectAll(validatePeople, entries, 'invalid');
});

test('S-4.11 edge: People boundaries below and at the minimum', () => {
  expectAll(validatePeople, ['0', '00', '000'], 'min');
  for (const [entry, count] of [['1', 1], ['01', 1], ['4', 4], ['\t4 ', 4]]) {
    expectValue(validatePeople, entry, count);
  }
});

test('S-4.12 edge: People boundaries at and above the maximum', () => {
  for (const [entry, count] of [['50', 50], ['050', 50], [' 50 ', 50], ['0050', 50]]) {
    expectValue(validatePeople, entry, count);
  }
  expectAll(validatePeople, ['51', '99', '100', '0051', NINES], 'max');
});

test('S-4.16 edge: validators treat anything that is not a string as empty and never throw', () => {
  const values = [undefined, null, 12, 1.5, NaN, Infinity, true, {}, [], () => 1, Symbol('x'), 10n];
  for (const value of values) {
    assert.deepEqual(validateBill(value), { ok: false, code: 'empty', message: null });
    assert.deepEqual(validateTip(value), { ok: false, code: 'empty', message: 'Enter a tip percentage. Use 0 for no tip.' });
    assert.deepEqual(validatePeople(value), { ok: false, code: 'empty', message: 'Enter the number of people.' });
  }
});

test('S-4.1 edge: results always have the same shape', () => {
  assert.deepEqual(Object.keys(validateBill('1')), ['ok', 'value']);
  assert.deepEqual(Object.keys(validateTip('1')), ['ok', 'value']);
  assert.deepEqual(Object.keys(validatePeople('1')), ['ok', 'value']);
  assert.deepEqual(Object.keys(validateBill('x')), ['ok', 'code', 'message']);
  assert.deepEqual(Object.keys(validateTip('x')), ['ok', 'code', 'message']);
  assert.deepEqual(Object.keys(validatePeople('x')), ['ok', 'code', 'message']);
});

test('S-2.5 edge: tips on a tie or just either side of one round half-up', () => {
  const rows = [
    ['0.10', '5', '0.01'], ['0.01', '50', '0.01'], ['0.01', '49.99', '0.00'], ['0.03', '50', '0.02'],
    ['0.05', '10', '0.01'], ['2.50', '15', '0.38'], ['1.00', '12.5', '0.13'], ['0.99', '1', '0.01'],
    ['0.49', '1', '0.00'], ['0.30', '15', '0.05'], ['999999.99', '100', '999999.99']
  ];
  for (const [bill, tip, expected] of rows) {
    assert.equal(tipFor(bill, tip), expected, `bill ${bill} at ${tip}%`);
  }
});

test('S-2.5 edge: tipCents returns null instead of NaN for unusable arguments', () => {
  const unusable = [
    ['12', 1500], [100, '1500'], [1.5, 1500], [100, 15.5], [-1, 1500], [100, -1], [NaN, 1500], [100, NaN],
    [Infinity, 1500], [100, Infinity], [null, 1500], [100, undefined], [10n, 1500], [{}, 1500],
    [Number.MAX_SAFE_INTEGER, 10000]
  ];
  for (const [bill, basisPoints] of unusable) {
    assert.equal(tipCents(bill, basisPoints), null, `arguments ${String(bill)}, ${String(basisPoints)}`);
  }
  assert.equal(tipCents(0, 0), 0);
  assert.equal(tipCents(100000000, 10000), 100000000);
});

test('S-3.5 edge: splitTotal at the extremes of the remainder', () => {
  assert.deepEqual(splitTotal(49, 50), { shares: [...new Array(49).fill(1), 0], extra: 49 });
  assert.deepEqual(splitTotal(1, 50), { shares: [1, ...new Array(49).fill(0)], extra: 1 });
  assert.deepEqual(splitTotal(50, 50), { shares: new Array(50).fill(1), extra: 0 });
  assert.deepEqual(splitTotal(0, 3), { shares: [0, 0, 0], extra: 0 });
  assert.deepEqual(splitTotal(200000000, 50), { shares: new Array(50).fill(4000000), extra: 0 });
  assert.deepEqual(splitTotal(200000001, 50), { shares: [4000001, ...new Array(49).fill(4000000)], extra: 1 });
});

test('S-3.6 edge: splitTotal returns null instead of NaN for unusable arguments', () => {
  const unusable = [
    [10, 0], [10, 51], [10, 2.5], [10, NaN], ['10', 2], [-1, 2], [1.5, 2], [NaN, 2],
    [10, '2'], [10, undefined], [undefined, 2], [10n, 2], [Infinity, 2], [10, Infinity]
  ];
  for (const [total, people] of unusable) {
    assert.equal(splitTotal(total, people), null, `arguments ${String(total)}, ${String(people)}`);
  }
});

test('S-1.2 edge: formatCents writes two decimals and never exponent notation', () => {
  const rows = [
    [0, '0.00'], [5, '0.05'], [100, '1.00'], [1234, '12.34'], [200000000, '2000000.00'],
    [Number.MAX_SAFE_INTEGER, '90071992547409.91']
  ];
  for (const [cents, expected] of rows) {
    assert.equal(formatCents(cents), expected);
  }
  for (const unusable of [-1, 1.5, NaN, '5', Infinity, undefined, null, 10n]) {
    assert.equal(formatCents(unusable), null, `argument ${String(unusable)}`);
  }
});

test('S-1.5 edge: the largest bill times the largest tip stays below the safe integer limit', () => {
  const largest = LIMITS.billMaxCents * LIMITS.tipMaxBasisPoints + 5000;
  assert.ok(Number.isSafeInteger(largest));
});

test('S-4.16 edge: viewModel treats missing or odd entries as empty and never throws', () => {
  for (const entries of [undefined, null, 'text', 42, true, [], {}, { bill: 5, tip: {}, people: [] }]) {
    const view = viewModel(entries);
    assert.equal(view.result, null);
    assert.deepEqual(view.fields.bill, { invalid: false, message: '' });
    assert.deepEqual(view.fields.tip, { invalid: true, message: 'Enter a tip percentage. Use 0 for no tip.' });
    assert.deepEqual(view.fields.people, { invalid: true, message: 'Enter the number of people.' });
  }
});
