(function () {
  'use strict';

  const { viewModel, resetState } = window.TipSplit.viewmodel;
  const names = ['bill', 'tip', 'people'];

  const inputs = {};
  const messageBoxes = {};
  names.forEach((name) => {
    inputs[name] = document.getElementById(name);
    messageBoxes[name] = document.getElementById(name + '-message');
  });

  const resultBox = document.getElementById('result');
  const tipOut = document.getElementById('result-tip');
  const totalOut = document.getElementById('result-total');
  const sharesList = document.getElementById('result-shares');
  const noteOut = document.getElementById('result-note');

  function readEntries() {
    return { bill: inputs.bill.value, tip: inputs.tip.value, people: inputs.people.value };
  }

  // A message is only rewritten when it changes, so screen readers do not repeat it on every key.
  function showFields(fields) {
    names.forEach((name) => {
      const field = fields[name];
      if (messageBoxes[name].textContent !== field.message) {
        messageBoxes[name].textContent = field.message;
      }
      inputs[name].setAttribute('aria-invalid', field.invalid ? 'true' : 'false');
    });
  }

  // With no result the box is emptied as well as hidden, so no old amount can stay on the page.
  function showResult(result) {
    sharesList.textContent = '';
    if (result === null) {
      tipOut.textContent = '';
      totalOut.textContent = '';
      noteOut.textContent = '';
      resultBox.hidden = true;
      return;
    }
    tipOut.textContent = result.tip;
    totalOut.textContent = result.total;
    result.shares.forEach((share) => {
      const item = document.createElement('li');
      item.textContent = share;
      sharesList.appendChild(item);
    });
    noteOut.textContent = result.note;
    resultBox.hidden = false;
  }

  function show(view) {
    showFields(view.fields);
    showResult(view.result);
  }

  function showState(state) {
    names.forEach((name) => {
      inputs[name].value = state.values[name];
    });
    show(state.view);
  }

  names.forEach((name) => {
    inputs[name].addEventListener('input', () => {
      show(viewModel(readEntries()));
    });
  });

  document.getElementById('reset').addEventListener('click', () => {
    showState(resetState());
    inputs.bill.focus();
  });

  showState(resetState());
}());
