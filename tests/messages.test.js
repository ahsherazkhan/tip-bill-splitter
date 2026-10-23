const { test } = require('node:test');
const assert = require('node:assert/strict');
const { viewModel } = require('../src/viewmodel.js');

function fieldMessage(field, bill, tip, people) {
  return viewModel({ bill, tip, people }).fields[field].message;
}

function resultNote(bill, tip, people) {
  return viewModel({ bill, tip, people }).result.note;
}

test('S-4.1 message: Bill with unusable text', () => {
  assert.equal(
    fieldMessage('bill', 'abc', '15', '2'),
    'Enter the bill using only digits and a decimal point, like 42.50.'
  );
});

test('S-4.2 message: Bill with too many decimals', () => {
  assert.equal(fieldMessage('bill', '10.005', '15', '2'), 'The bill can have at most 2 decimal places.');
});

test('S-4.3 message: Bill below the minimum', () => {
  assert.equal(fieldMessage('bill', '0', '15', '2'), 'The bill must be at least 0.01.');
});

test('S-4.4 message: Bill above the maximum', () => {
  assert.equal(fieldMessage('bill', '1000000.01', '15', '2'), 'The bill cannot be more than 1000000.00.');
});

test('S-4.5 message: empty Tip %', () => {
  assert.equal(fieldMessage('tip', '100', '', '2'), 'Enter a tip percentage. Use 0 for no tip.');
});

test('S-4.6 message: Tip % with unusable text', () => {
  assert.equal(
    fieldMessage('tip', '100', 'abc', '2'),
    'Enter the tip using only digits and a decimal point, like 15 or 12.5.'
  );
});

test('S-4.7 message: Tip % with too many decimals', () => {
  assert.equal(fieldMessage('tip', '100', '12.505', '2'), 'The tip can have at most 2 decimal places.');
});

test('S-4.8 message: Tip % above the maximum', () => {
  assert.equal(fieldMessage('tip', '100', '100.01', '2'), 'The tip cannot be more than 100%.');
});

test('S-4.9 message: empty People', () => {
  assert.equal(fieldMessage('people', '100', '15', ''), 'Enter the number of people.');
});

test('S-4.10 message: People that is not a whole number', () => {
  assert.equal(
    fieldMessage('people', '100', '15', '2.5'),
    'Enter the number of people as a whole number, like 4.'
  );
});

test('S-4.11 message: People below the minimum', () => {
  assert.equal(fieldMessage('people', '100', '15', '0'), 'There must be at least 1 person.');
});

test('S-4.12 message: People above the maximum', () => {
  assert.equal(fieldMessage('people', '100', '15', '51'), 'There can be at most 50 people.');
});

test('S-3.1 message: the note when one person pays 1 cent more', () => {
  assert.equal(
    resultNote('100', '0', '3'),
    'The total does not divide evenly. The first person pays 1 cent more.'
  );
});

test('S-3.2 message: the note when several people pay 1 cent more', () => {
  assert.equal(
    resultNote('42.50', '18', '3'),
    'The total does not divide evenly. The first 2 people pay 1 cent more.'
  );
});
