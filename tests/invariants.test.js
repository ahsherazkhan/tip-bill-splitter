const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LIMITS, validateBill, validateTip, validatePeople } = require('../src/calc.js');
const { DEFAULTS, viewModel, resetState } = require('../src/viewmodel.js');
const messages = require('../src/messages.js');

// The seed is fixed, so npm test gives the same result every run.
// SEED=12345 npm test runs the same checks with another seed; a failure prints the seed it used.
const DEFAULT_SEED = 1;
const CASES = 2000;

function readSeed(raw) {
  if (raw === undefined || raw === '') {
    return DEFAULT_SEED;
  }
  if (!/^[0-9]{1,10}$/.test(raw) || Number(raw) > 4294967295) {
    throw new Error(`SEED must be a whole number from 0 to 4294967295, got ${JSON.stringify(raw)}`);
  }
  return Number(raw);
}

const SEED = readSeed(process.env.SEED);

function makeRng(seed) {
  let state = seed >>> 0;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }
  return {
    next,
    int(min, max) {
      return min + (next() % (max - min + 1));
    }
  };
}

function describeInput(input) {
  try {
    const text = JSON.stringify(input);
    return text === undefined ? String(input) : text;
  } catch (error) {
    return String(input);
  }
}

function forCases(make, check) {
  const rng = makeRng(SEED);
  for (let i = 0; i < CASES; i += 1) {
    const input = make(rng);
    try {
      check(input);
    } catch (error) {
      throw new Error(
        `failed with SEED=${SEED} at case ${i}, input ${describeInput(input)}: ${error.message}\nreplay with: SEED=${SEED} npm test`,
        { cause: error }
      );
    }
  }
}

function quotient(a, b) {
  return (a - (a % b)) / b;
}

function sum(list) {
  return list.reduce((total, value) => total + value, 0);
}

function pad2(n) {
  return (n < 10 ? '0' : '') + String(n);
}

function hundredthsText(n) {
  return String(quotient(n, 100)) + '.' + pad2(n % 100);
}

function textToCents(text) {
  const [whole, fraction] = text.split('.');
  return Number(whole) * 100 + Number(fraction);
}

function pick(rng, list) {
  return list[rng.int(0, list.length - 1)];
}

const BLANKS = ['', '', '', ' ', '  ', '\t', ' ', ' \t '];
const ALPHABET = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '.', '.', ',', '-', '+', 'e', 'E', 'x',
  ' ', '\t', ' ', '\n', 'a', 'Z', '٣', '１', '−', '%', '$', '"', '\'', ' ', '​'
];
const WORDS = ['NaN', 'Infinity', '-Infinity', 'undefined', 'null', '1e21', '1e+21', '0x10', '-0', '1e400'];
const ODD_VALUES = [undefined, null, 12, 1.5, NaN, Infinity, true, {}, [], () => 1, Symbol('x'), 10n];

// Leading zeros and blanks around a number are allowed spellings.
function spell(rng, text) {
  const zeros = rng.int(0, 3) === 0 ? '0'.repeat(rng.int(1, 3)) : '';
  return pick(rng, BLANKS) + zeros + text + pick(rng, BLANKS);
}

function randomBillCents(rng) {
  const mode = rng.int(0, 5);
  if (mode === 0) {
    return rng.int(1, 200);
  }
  if (mode === 1) {
    return LIMITS.billMaxCents - rng.int(0, 200);
  }
  return rng.int(1, LIMITS.billMaxCents);
}

function validCase(rng) {
  const billCents = randomBillCents(rng);
  const basisPoints = rng.int(0, 5) === 0
    ? pick(rng, [0, 1, 50, 100, 9999, 10000])
    : rng.int(0, LIMITS.tipMaxBasisPoints);
  const people = rng.int(0, 5) === 0
    ? pick(rng, [1, 2, 49, 50])
    : rng.int(LIMITS.peopleMin, LIMITS.peopleMax);
  return {
    billCents,
    basisPoints,
    people,
    entries: {
      bill: spell(rng, hundredthsText(billCents)),
      tip: spell(rng, hundredthsText(basisPoints)),
      people: spell(rng, String(people))
    }
  };
}

function digitsText(rng, maxLength) {
  const length = rng.int(1, maxLength);
  let text = '';
  for (let i = 0; i < length; i += 1) {
    text += String(rng.int(0, 9));
  }
  if (rng.int(0, 1) === 0) {
    const at = rng.int(0, text.length);
    text = text.slice(0, at) + '.' + text.slice(at);
  }
  return text;
}

function hostileText(rng) {
  const mode = rng.int(0, 9);
  if (mode === 0) {
    return '';
  }
  if (mode === 1) {
    return pick(rng, WORDS);
  }
  if (mode === 2) {
    return pick(rng, WORDS) + pick(rng, BLANKS);
  }
  if (mode === 8) {
    return digitsText(rng, 12);
  }
  if (mode === 9) {
    return digitsText(rng, 400);
  }
  const length = mode === 7 ? rng.int(100, 400) : rng.int(1, 12);
  let text = '';
  for (let i = 0; i < length; i += 1) {
    text += pick(rng, ALPHABET);
  }
  return text;
}

function mixedEntry(rng, validText) {
  const mode = rng.int(0, 9);
  if (mode < 6) {
    return validText;
  }
  if (mode === 6) {
    return '';
  }
  if (mode === 7) {
    return pick(rng, BLANKS);
  }
  return hostileText(rng);
}

function mixedCase(rng) {
  const valid = validCase(rng).entries;
  return {
    bill: mixedEntry(rng, valid.bill),
    tip: mixedEntry(rng, valid.tip),
    people: mixedEntry(rng, valid.people)
  };
}

function hostileCase(rng) {
  return { bill: hostileText(rng), tip: hostileText(rng), people: hostileText(rng) };
}

function hostileValue(rng) {
  return rng.int(0, 5) === 0 ? pick(rng, ODD_VALUES) : hostileText(rng);
}

function outcome(c) {
  const view = viewModel(c.entries);
  assert.notEqual(view.result, null, 'a valid case must give a result');
  return {
    tip: textToCents(view.result.tip),
    total: textToCents(view.result.total),
    shares: view.result.shares.map(textToCents),
    note: view.result.note
  };
}

function expectedNote(extra) {
  if (extra === 0) {
    return '';
  }
  if (extra === 1) {
    return 'The total does not divide evenly. The first person pays 1 cent more.';
  }
  return `The total does not divide evenly. The first ${extra} people pay 1 cent more.`;
}

const ERROR_MESSAGES = new Set([
  ...Object.values(messages.bill),
  ...Object.values(messages.tip),
  ...Object.values(messages.people)
]);

function isKnownNote(text) {
  if (text === '' || text === messages.note.one) {
    return true;
  }
  const [before, after] = messages.note.many.split('{count}');
  if (!text.startsWith(before) || !text.endsWith(after) || text.length <= before.length + after.length) {
    return false;
  }
  return /^[0-9]+$/.test(text.slice(before.length, text.length - after.length));
}

function producedText(view) {
  const found = [view.fields.bill.message, view.fields.tip.message, view.fields.people.message];
  if (view.result !== null) {
    found.push(view.result.tip, view.result.total, ...view.result.shares, view.result.note);
  }
  return found;
}

const FORBIDDEN = /NaN|Infinity|undefined|[0-9][eE][+-]?[0-9]/;

test('S-3.6 invariant: shares add up exactly to the total', () => {
  forCases(validCase, (c) => {
    const out = outcome(c);
    assert.equal(sum(out.shares), out.total);
  });
});

test('S-3.6 invariant: shares differ by at most 1 cent, never increase, and total % people of them are larger', () => {
  forCases(validCase, (c) => {
    const out = outcome(c);
    const extra = out.total % c.people;
    const base = quotient(out.total, c.people);
    assert.equal(out.shares.length, c.people);
    for (let i = 1; i < out.shares.length; i += 1) {
      assert.ok(out.shares[i] <= out.shares[i - 1], 'a later share is larger than an earlier one');
    }
    assert.ok(Math.max(...out.shares) - Math.min(...out.shares) <= 1);
    assert.equal(out.shares.filter((share) => share === base + 1).length, extra);
    assert.equal(out.note, expectedNote(extra));
  });
});

test('S-2.5 invariant: the tip is the tip on the whole bill rounded half-up to the cent', () => {
  forCases(validCase, (c) => {
    const out = outcome(c);
    const exactTimes10000 = c.billCents * c.basisPoints;
    assert.ok(10000 * out.tip <= exactTimes10000 + 5000, 'tip rounded too high');
    assert.ok(exactTimes10000 + 5000 < 10000 * (out.tip + 1), 'tip rounded too low');
  });
});

test('S-1.2 invariant: total is bill plus tip, and every amount has two decimals and stays in bounds', () => {
  forCases(validCase, (c) => {
    const view = viewModel(c.entries);
    for (const text of [view.result.tip, view.result.total, ...view.result.shares]) {
      assert.match(text, /^[0-9]+\.[0-9]{2}$/);
    }
    const out = outcome(c);
    assert.equal(out.total, c.billCents + out.tip);
    assert.ok(out.total <= 2 * LIMITS.billMaxCents);
  });
});

test('S-5.7 invariant: a result and a message never show together, and an empty Bill shows neither', () => {
  forCases(mixedCase, (entries) => {
    const view = viewModel(entries);
    const fields = Object.values(view.fields);
    const shown = fields.filter((field) => field.message !== '').length;
    for (const field of fields) {
      assert.equal(field.invalid, field.message !== '');
    }
    if (view.result !== null) {
      assert.equal(shown, 0, 'a result is showing together with a message');
    }
    if (shown > 0) {
      assert.equal(view.result, null, 'a message is showing together with a result');
    }
    const checks = [validateBill(entries.bill), validateTip(entries.tip), validatePeople(entries.people)];
    assert.equal(view.result !== null, checks.every((check) => check.ok), 'a result must show exactly when all three entries are usable');
    if (checks[0].code === 'empty') {
      assert.equal(view.result, null);
      assert.equal(view.fields.bill.message, '');
    }
  });
});

test('S-4.16 invariant: no message, amount or note contains NaN, Infinity, undefined or exponent notation', () => {
  function check(entries) {
    const view = viewModel(entries);
    for (const text of producedText(view)) {
      assert.doesNotMatch(text, FORBIDDEN);
    }
    for (const field of Object.values(view.fields)) {
      assert.ok(field.message === '' || ERROR_MESSAGES.has(field.message), 'a message that is not in messages.js');
    }
    if (view.result !== null) {
      for (const text of [view.result.tip, view.result.total, ...view.result.shares]) {
        assert.match(text, /^[0-9]+\.[0-9]{2}$/);
      }
      assert.ok(isKnownNote(view.result.note), 'a note that is not in messages.js');
    }
  }
  forCases(hostileCase, check);
  forCases(mixedCase, check);
});

test('S-6.4 invariant: the same entries give the same view, entries are not changed, and Reset always gives the opening state', () => {
  const opening = resetState();
  assert.deepEqual(opening, { values: { bill: '', tip: '15', people: '2' }, view: viewModel(DEFAULTS) });
  forCases(mixedCase, (entries) => {
    const copy = { ...entries };
    assert.deepEqual(viewModel(entries), viewModel(entries));
    assert.deepEqual(entries, copy);
    assert.deepEqual(resetState(), opening);
  });
  const changed = resetState();
  changed.values.bill = '123';
  assert.equal(resetState().values.bill, '');
});

test('S-4.1 invariant: validators never throw and always return a boolean ok', () => {
  const rows = [
    ['bill', validateBill, LIMITS.billMinCents, LIMITS.billMaxCents],
    ['tip', validateTip, 0, LIMITS.tipMaxBasisPoints],
    ['people', validatePeople, LIMITS.peopleMin, LIMITS.peopleMax]
  ];
  forCases(hostileValue, (value) => {
    for (const [name, validate, low, high] of rows) {
      const result = validate(value);
      assert.equal(typeof result.ok, 'boolean', name);
      if (result.ok) {
        assert.ok(Number.isSafeInteger(result.value) && result.value >= low && result.value <= high, `${name} value out of range`);
      } else {
        assert.equal(typeof result.code, 'string', name);
        assert.ok(result.message === null || ERROR_MESSAGES.has(result.message), `${name} message is not in messages.js`);
      }
    }
  });
});
