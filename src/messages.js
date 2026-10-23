(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TipSplit = root.TipSplit || {};
    root.TipSplit.messages = factory();
  }
}(this, function () {
  'use strict';

  return Object.freeze({
    bill: Object.freeze({
      invalid: 'Enter the bill using only digits and a decimal point, like 42.50.',
      decimals: 'The bill can have at most 2 decimal places.',
      min: 'The bill must be at least 0.01.',
      max: 'The bill cannot be more than 1000000.00.'
    }),
    tip: Object.freeze({
      empty: 'Enter a tip percentage. Use 0 for no tip.',
      invalid: 'Enter the tip using only digits and a decimal point, like 15 or 12.5.',
      decimals: 'The tip can have at most 2 decimal places.',
      max: 'The tip cannot be more than 100%.'
    }),
    people: Object.freeze({
      empty: 'Enter the number of people.',
      invalid: 'Enter the number of people as a whole number, like 4.',
      min: 'There must be at least 1 person.',
      max: 'There can be at most 50 people.'
    }),
    note: Object.freeze({
      one: 'The total does not divide evenly. The first person pays 1 cent more.',
      many: 'The total does not divide evenly. The first {count} people pay 1 cent more.'
    })
  });
}));
