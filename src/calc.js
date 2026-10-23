(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./messages.js'));
  } else {
    root.TipSplit = root.TipSplit || {};
    root.TipSplit.calc = factory(root.TipSplit.messages);
  }
}(this, function (messages) {
  'use strict';

  const LIMITS = Object.freeze({
    billMinCents: 1,
    billMaxCents: 100000000,
    tipMaxBasisPoints: 10000,
    peopleMin: 1,
    peopleMax: 50
  });

  const DECIMAL_SHAPE = /^([0-9]*)(\.?)([0-9]*)$/;
  const WHOLE_SHAPE = /^[0-9]+$/;

  // For safe integers a % b is exact, so this division never rounds.
  function quotient(a, b) {
    return (a - (a % b)) / b;
  }

  function digitCount(n) {
    return String(n).length;
  }

  // The most whole digits an entry can have and still be inside its limit.
  const BILL_WHOLE_DIGITS = digitCount(quotient(LIMITS.billMaxCents, 100));
  const TIP_WHOLE_DIGITS = digitCount(quotient(LIMITS.tipMaxBasisPoints, 100));
  const PEOPLE_DIGITS = digitCount(LIMITS.peopleMax);

  function isBlank(code) {
    return code === 32 || code === 9 || code === 160;
  }

  // Only space, tab and non-breaking space are ignored at the ends.
  function trimEnds(text) {
    let start = 0;
    let end = text.length;
    while (start < end && isBlank(text.charCodeAt(start))) {
      start += 1;
    }
    while (end > start && isBlank(text.charCodeAt(end - 1))) {
      end -= 1;
    }
    return text.slice(start, end);
  }

  function normalise(text) {
    return typeof text === 'string' ? trimEnds(text) : '';
  }

  function stripLeadingZeros(digits) {
    let i = 0;
    while (i < digits.length && digits.charCodeAt(i) === 48) {
      i += 1;
    }
    return digits.slice(i);
  }

  // Digits only, and short enough to be exact. Text never goes through Number or parseFloat.
  function digitsToInt(digits) {
    let value = 0;
    for (let i = 0; i < digits.length; i += 1) {
      value = value * 10 + (digits.charCodeAt(i) - 48);
    }
    return value;
  }

  function splitDecimal(entry) {
    const match = DECIMAL_SHAPE.exec(entry);
    if (match === null || (match[1] === '' && match[3] === '')) {
      return { code: 'invalid' };
    }
    if (match[3].length > 2) {
      return { code: 'decimals' };
    }
    return { whole: stripLeadingZeros(match[1]), fraction: match[3] };
  }

  // Whole digits and up to two fraction digits, as a count of hundredths.
  function hundredths(whole, fraction) {
    const part = fraction.length === 1 ? digitsToInt(fraction) * 10 : digitsToInt(fraction);
    return digitsToInt(whole) * 100 + part;
  }

  function fail(field, code) {
    const text = messages[field][code];
    return { ok: false, code, message: typeof text === 'string' ? text : null };
  }

  function validateBill(text) {
    const entry = normalise(text);
    if (entry === '') {
      return fail('bill', 'empty');
    }
    const parts = splitDecimal(entry);
    if (parts.code !== undefined) {
      return fail('bill', parts.code);
    }
    if (parts.whole.length > BILL_WHOLE_DIGITS) {
      return fail('bill', 'max');
    }
    const cents = hundredths(parts.whole, parts.fraction);
    if (cents < LIMITS.billMinCents) {
      return fail('bill', 'min');
    }
    if (cents > LIMITS.billMaxCents) {
      return fail('bill', 'max');
    }
    return { ok: true, value: cents };
  }

  function validateTip(text) {
    const entry = normalise(text);
    if (entry === '') {
      return fail('tip', 'empty');
    }
    const parts = splitDecimal(entry);
    if (parts.code !== undefined) {
      return fail('tip', parts.code);
    }
    if (parts.whole.length > TIP_WHOLE_DIGITS) {
      return fail('tip', 'max');
    }
    const basisPoints = hundredths(parts.whole, parts.fraction);
    if (basisPoints > LIMITS.tipMaxBasisPoints) {
      return fail('tip', 'max');
    }
    return { ok: true, value: basisPoints };
  }

  function validatePeople(text) {
    const entry = normalise(text);
    if (entry === '') {
      return fail('people', 'empty');
    }
    if (!WHOLE_SHAPE.test(entry)) {
      return fail('people', 'invalid');
    }
    const digits = stripLeadingZeros(entry);
    if (digits.length > PEOPLE_DIGITS) {
      return fail('people', 'max');
    }
    const count = digitsToInt(digits);
    if (count < LIMITS.peopleMin) {
      return fail('people', 'min');
    }
    if (count > LIMITS.peopleMax) {
      return fail('people', 'max');
    }
    return { ok: true, value: count };
  }

  function isCount(n) {
    return Number.isSafeInteger(n) && n >= 0;
  }

  // The tip on the whole bill, rounded half-up to the cent, once.
  function tipCents(billCents, basisPoints) {
    if (!isCount(billCents) || !isCount(basisPoints)) {
      return null;
    }
    const scaled = billCents * basisPoints + 5000;
    if (!Number.isSafeInteger(scaled)) {
      return null;
    }
    return quotient(scaled, 10000);
  }

  // The first `extra` shares are one cent larger than the rest.
  function splitTotal(totalCents, people) {
    const peopleOk = Number.isInteger(people) && people >= LIMITS.peopleMin && people <= LIMITS.peopleMax;
    if (!isCount(totalCents) || !peopleOk) {
      return null;
    }
    const extra = totalCents % people;
    const base = quotient(totalCents, people);
    const shares = [];
    for (let i = 0; i < people; i += 1) {
      shares.push(i < extra ? base + 1 : base);
    }
    return { shares, extra };
  }

  function formatCents(cents) {
    if (!isCount(cents)) {
      return null;
    }
    const fraction = cents % 100;
    return String(quotient(cents, 100)) + '.' + (fraction < 10 ? '0' : '') + String(fraction);
  }

  return {
    LIMITS,
    validateBill,
    validateTip,
    validatePeople,
    tipCents,
    splitTotal,
    formatCents
  };
}));
