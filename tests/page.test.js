const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const messages = require('../src/messages.js');

const SRC = path.join(__dirname, '..', 'src');
const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(SRC, 'app.js'), 'utf8');

const FIELDS = [
  { id: 'bill', label: 'Bill', inputmode: 'decimal' },
  { id: 'tip', label: 'Tip %', inputmode: 'decimal' },
  { id: 'people', label: 'People', inputmode: 'numeric' }
];

const jsWithoutComments = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const jsCodeOnly = jsWithoutComments.replace(
  /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g,
  "''"
);

function attributesOf(id) {
  const match = new RegExp('<([a-z0-9]+)\\b([^>]*\\bid="' + id + '"[^>]*)>', 'i').exec(html);
  assert.ok(match !== null, `no element with id ${id}`);
  const attributes = {};
  for (const item of match[2].matchAll(/([a-z-]+)(?:="([^"]*)")?/gi)) {
    attributes[item[1]] = item[2] === undefined ? true : item[2];
  }
  return { tag: match[1].toLowerCase(), attributes };
}

function cssRules() {
  const rules = [];
  for (const chunk of css.replace(/\/\*[\s\S]*?\*\//g, '').split('}')) {
    const at = chunk.indexOf('{');
    if (at !== -1) {
      rules.push({ selector: chunk.slice(0, at).trim(), body: chunk.slice(at + 1) });
    }
  }
  return rules;
}

test('PAGE-1 the scripts are classic tags in dependency order: messages, calc, viewmodel, app', () => {
  const tags = [...html.matchAll(/<script\b([^>]*)>/gi)].map((match) => match[1]);
  const sources = tags.map((attributes) => {
    const found = /\bsrc="([^"]*)"/.exec(attributes);
    return found === null ? null : found[1];
  });
  assert.deepEqual(sources, ['messages.js', 'calc.js', 'viewmodel.js', 'app.js']);
  for (const attributes of tags) {
    assert.doesNotMatch(attributes, /\btype\b|\bdefer\b|\basync\b|\bnomodule\b/i);
  }
  assert.doesNotMatch(html, /<script\b[^>]*>\s*[^<\s]/i, 'there is an inline script');
  for (const file of sources) {
    assert.ok(fs.existsSync(path.join(SRC, file)), `${file} is missing from src`);
  }
});

test('PAGE-2 nothing is loaded from outside', () => {
  for (const match of html.matchAll(/\b(?:src|href)="([^"]*)"/gi)) {
    assert.match(match[1], /^[A-Za-z0-9._-]+$/, `not a plain local file name: ${match[1]}`);
  }
  assert.doesNotMatch(html, /https?:|<iframe|<img|<video|<audio|<object|<embed|<source|<base/i);
  assert.doesNotMatch(css, /@import|@font-face|url\(|https?:/i);
  const scripts = fs.readdirSync(SRC).filter((file) => file.endsWith('.js')).sort();
  assert.deepEqual(scripts, ['app.js', 'calc.js', 'messages.js', 'viewmodel.js']);
  for (const file of scripts) {
    const source = fs.readFileSync(path.join(SRC, file), 'utf8');
    assert.doesNotMatch(
      source,
      /https?:|\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts|\bimport\s*\(|\bnew Image\b/,
      file
    );
  }
});

test('PAGE-3 app.js holds no message text and no money logic', () => {
  for (const group of Object.values(messages)) {
    for (const text of Object.values(group)) {
      for (const piece of text.split('{count}')) {
        assert.ok(!jsWithoutComments.includes(piece), `app.js contains message text: ${piece}`);
      }
    }
  }
  assert.doesNotMatch(jsWithoutComments, /(['"`])(?:(?!\1)[^\\\n]){20,}\1/, 'app.js has a long string literal');
  assert.doesNotMatch(jsCodeOnly, /parseFloat|parseInt|Number|toFixed|Math|BigInt|Intl|toLocale/);
  assert.doesNotMatch(jsCodeOnly, /[*\/%]/, 'app.js multiplies, divides or takes a remainder');
  assert.doesNotMatch(jsCodeOnly, /\b(validate\w*|tipCents|splitTotal|formatCents|calc|messages)\b/);
});

test('PAGE-4 each entry has a label, a text input with the right inputmode and autocomplete off, and a live message box it points to', () => {
  for (const field of FIELDS) {
    assert.ok(html.includes(`<label for="${field.id}">${field.label}</label>`), `label for ${field.id}`);
    const input = attributesOf(field.id);
    assert.equal(input.tag, 'input');
    assert.equal(input.attributes.type, 'text');
    assert.equal(input.attributes.inputmode, field.inputmode);
    assert.equal(input.attributes.autocomplete, 'off');
    assert.equal(input.attributes['aria-invalid'], 'false');
    assert.equal(input.attributes['aria-describedby'], `${field.id}-message`);
    const box = attributesOf(`${field.id}-message`);
    assert.equal(box.attributes['aria-live'], 'polite');
    assert.match(html, new RegExp(`id="${field.id}-message"[^>]*></p>`), 'the message box starts empty');
  }
  assert.doesNotMatch(html, /<form\b|type="number"|maxlength|tabindex|autofocus/i);
  const order = ['bill', 'tip', 'people', 'reset'].map((id) => html.indexOf(`id="${id}"`));
  assert.ok(order.every((position, index) => position > (index === 0 ? -1 : order[index - 1])), 'tab order is Bill, Tip %, People, Reset');
});

test('PAGE-5 the Result box, its labels, the numbered list under Each person pays and the Reset button are in place', () => {
  const result = attributesOf('result');
  assert.equal(result.tag, 'section');
  assert.equal(result.attributes.hidden, true);
  assert.equal(result.attributes['aria-label'], 'Result');
  assert.ok(html.includes('<dt>Tip</dt><dd id="result-tip"></dd>'));
  assert.ok(html.includes('<dt>Total</dt><dd id="result-total"></dd>'));
  assert.ok(html.includes('<h2 id="shares-heading">Each person pays</h2>'));
  const list = attributesOf('result-shares');
  assert.equal(list.tag, 'ol');
  assert.equal(list.attributes['aria-labelledby'], 'shares-heading');
  assert.ok(html.includes('<p id="result-note"></p>'));
  assert.ok(html.indexOf('id="shares-heading"') < html.indexOf('id="result-shares"'));
  assert.ok(html.indexOf('id="result-shares"') < html.indexOf('id="result-note"'));
  assert.ok(html.includes('<button id="reset" type="button">Reset</button>'));
});

test('PAGE-6 the stylesheet keeps hidden things hidden, uses 16 px text and 44 px controls, shows a focus ring and sets no wide fixed width', () => {
  const rules = cssRules();
  const rule = (selector) => rules.find((item) => item.selector === selector);
  assert.match(rule('[hidden]').body, /display:\s*none/);
  assert.match(rule('input').body, /font-size:\s*16px/);
  assert.match(rule('input').body, /min-height:\s*44px/);
  assert.match(rule('button').body, /min-height:\s*44px/);
  const focus = rules.find((item) => item.selector.includes(':focus'));
  assert.match(focus.body, /outline:\s*\d+px solid/);
  assert.doesNotMatch(css, /outline:\s*(none|0)|outline-width:\s*0/);
  for (const match of css.matchAll(/(?:^|[;{\s])(?:min-)?width:\s*(\d+)px/g)) {
    assert.ok(Number(match[1]) <= 320, `a fixed width of ${match[1]}px is wider than 320px`);
  }
  assert.ok(html.includes('<meta name="viewport" content="width=device-width, initial-scale=1">'));
});

test('PAGE-7 app.js reads the entries, calls the view-model on input and on Reset, and focuses Bill after Reset', () => {
  assert.match(js, /\.value\b/);
  assert.match(js, /'input'[\s\S]*viewModel\(/);
  assert.match(js, /'click'[\s\S]*resetState\(\)[\s\S]*\.focus\(\)/);
  assert.ok((js.match(/resetState\(\)/g) || []).length >= 2, 'the opening values should come from resetState too');
  assert.match(js, /result === null/);
});

test('PAGE-8 app.js clears the shares list on every update and empties and hides the Result box when there is no result', () => {
  const start = js.indexOf('function showResult(result) {');
  assert.ok(start !== -1, 'showResult is missing');
  const body = js.slice(start, js.indexOf('\n  }\n', start));
  const clearList = body.indexOf("sharesList.textContent = ''");
  const noResult = body.indexOf('if (result === null) {');
  assert.ok(clearList !== -1 && clearList < noResult, 'the shares list is not cleared before it is rebuilt');
  assert.ok(noResult < body.indexOf('appendChild'), 'the list is built before the no-result check');
  const emptyBranch = body.slice(noResult, body.indexOf('return;', noResult));
  for (const line of ["tipOut.textContent = ''", "totalOut.textContent = ''", "noteOut.textContent = ''", 'resultBox.hidden = true']) {
    assert.ok(emptyBranch.includes(line), `the no-result branch does not do: ${line}`);
  }
  assert.ok(body.includes('resultBox.hidden = false'), 'the Result box is never shown again');
});
