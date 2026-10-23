(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./calc.js'), require('./messages.js'));
  } else {
    root.TipSplit = root.TipSplit || {};
    root.TipSplit.viewmodel = factory(root.TipSplit.calc, root.TipSplit.messages);
  }
}(this, function (calc, messages) {
  'use strict';

  const DEFAULTS = Object.freeze({ bill: '', tip: '15', people: '2' });

  // An empty Bill has no message, so a missing message never means "show an error".
  function fieldState(check) {
    const message = check.ok || check.message === null ? '' : check.message;
    return { invalid: message !== '', message };
  }

  function noteFor(extra) {
    if (extra === 0) {
      return '';
    }
    if (extra === 1) {
      return messages.note.one;
    }
    return messages.note.many.replace('{count}', String(extra));
  }

  function buildResult(billCents, basisPoints, people) {
    const tipAmount = calc.tipCents(billCents, basisPoints);
    if (tipAmount === null) {
      return null;
    }
    const total = billCents + tipAmount;
    const split = calc.splitTotal(total, people);
    if (split === null) {
      return null;
    }
    return {
      tip: calc.formatCents(tipAmount),
      total: calc.formatCents(total),
      shares: split.shares.map((cents) => calc.formatCents(cents)),
      note: noteFor(split.extra)
    };
  }

  function viewModel(entries) {
    const source = entries !== null && typeof entries === 'object' ? entries : {};
    const bill = calc.validateBill(source.bill);
    const tip = calc.validateTip(source.tip);
    const people = calc.validatePeople(source.people);
    const allUsable = bill.ok && tip.ok && people.ok;
    return {
      fields: {
        bill: fieldState(bill),
        tip: fieldState(tip),
        people: fieldState(people)
      },
      result: allUsable ? buildResult(bill.value, tip.value, people.value) : null
    };
  }

  function resetState() {
    const values = { bill: DEFAULTS.bill, tip: DEFAULTS.tip, people: DEFAULTS.people };
    return { values, view: viewModel(values) };
  }

  return { DEFAULTS, viewModel, resetState };
}));
