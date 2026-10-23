const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const messages = require('../src/messages.js');
const { LIMITS } = require('../src/calc.js');

const ROOT = path.join(__dirname, '..');

function read(...parts) {
  return fs.readFileSync(path.join(ROOT, ...parts), 'utf8');
}

const stories = read('docs', 'user-stories.md');

// A quoted string counts as a message only if it starts with a capital letter and ends with a full stop.
function quotedMessages(text) {
  const found = [];
  for (const line of text.split('\n')) {
    for (const match of line.matchAll(/"([^"\n]*)"/g)) {
      if (/^[A-Z]/.test(match[1]) && match[1].endsWith('.')) {
        found.push(match[1]);
      }
    }
  }
  return found;
}

function messageTexts() {
  const fixed = [];
  const templates = [];
  for (const group of Object.values(messages)) {
    for (const text of Object.values(group)) {
      (text.includes('{count}') ? templates : fixed).push(text);
    }
  }
  return { fixed, templates };
}

// The filled-in form of a template; the many-people note is only used from 2 people.
function matchesTemplate(template, text) {
  const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp('^' + escaped.replace('\\{count\\}', '([0-9]+)') + '$').exec(text);
  return match !== null && Number(match[1]) >= 2;
}

test('DOCS-1 every message in messages.js is quoted in the stories doc', () => {
  const quoted = quotedMessages(stories);
  const { fixed, templates } = messageTexts();
  for (const text of fixed) {
    assert.ok(quoted.includes(text), `not quoted in the stories doc: ${text}`);
  }
  for (const template of templates) {
    const filled = quoted.some((text) => matchesTemplate(template, text));
    assert.ok(filled, `no filled-in form quoted in the stories doc: ${template}`);
  }
});

test('DOCS-2 every message quoted in the stories doc is in messages.js', () => {
  const { fixed, templates } = messageTexts();
  for (const text of quotedMessages(stories)) {
    const known = fixed.includes(text) || templates.some((template) => matchesTemplate(template, text));
    assert.ok(known, `quoted in the stories doc but not in messages.js: ${text}`);
  }
});

// Criteria that need a browser check because they depend on the page itself.
// They may also have automated support tests; the browser check is still required.
const MANUAL = ['S-1.1', 'S-4.15', 'S-5.1', 'S-5.2', 'S-5.3', 'S-5.4', 'S-5.5', 'S-5.6', 'S-6.1', 'S-6.2', 'S-6.3'];

// Criteria for features that are not built. They must have no tests at all.
const NOT_BUILT = ['S-7.1', 'S-7.2', 'S-8.1', 'S-8.2'];

const TEST_DIR = path.join(ROOT, 'tests');

function criterionIds() {
  return [...stories.matchAll(/^- (S-\d+\.\d+) /gm)].map((match) => match[1]);
}

function testNames() {
  const names = [];
  for (const file of fs.readdirSync(TEST_DIR)) {
    if (!file.endsWith('.test.js')) {
      continue;
    }
    const source = fs.readFileSync(path.join(TEST_DIR, file), 'utf8');
    const calls = (source.match(/^test\(/gm) || []).length;
    const named = [...source.matchAll(/^test\(\s*'([^'\n]*)'/gm)].map((match) => match[1]);
    assert.equal(named.length, calls, `${file}: every top-level test call needs a single-quoted name`);
    names.push(...named);
  }
  return names;
}

function testedIds() {
  return testNames()
    .map((name) => /^(S-\d+\.\d+)[ :]/.exec(name))
    .filter((match) => match !== null)
    .map((match) => match[1]);
}

test('DOCS-3 every test name starts with a criterion id from the docs, DOCS- or PAGE-', () => {
  const ids = new Set(criterionIds());
  for (const name of testNames()) {
    if (name.startsWith('DOCS-') || name.startsWith('PAGE-')) {
      continue;
    }
    const match = /^(S-\d+\.\d+)[ :]/.exec(name);
    assert.ok(match !== null, `test name does not start with a criterion id: ${name}`);
    assert.ok(ids.has(match[1]), `test name uses ${match[1]}, which is not in the stories doc: ${name}`);
  }
});

test('DOCS-4 every criterion has a test, is on the manual list or is on the not-built list', () => {
  const ids = criterionIds();
  const tested = new Set(testedIds());
  for (const id of ids) {
    assert.ok(tested.has(id) || MANUAL.includes(id) || NOT_BUILT.includes(id), `${id} has no test and is on neither list`);
  }
  for (const id of [...MANUAL, ...NOT_BUILT]) {
    assert.ok(ids.includes(id), `${id} is on a list but is not in the stories doc`);
  }
  for (const id of MANUAL) {
    assert.ok(!NOT_BUILT.includes(id), `${id} is on both lists`);
  }
});

test('DOCS-5 the not-built criteria have no tests', () => {
  const tested = new Set(testedIds());
  for (const id of NOT_BUILT) {
    assert.ok(!tested.has(id), `${id} is not built but has a test`);
  }
});

test('DOCS-6 every message in messages.js has a test in messages.test.js', () => {
  const source = read('tests', 'messages.test.js');
  const literals = [...source.matchAll(/'([^'\n]*)'/g)].map((match) => match[1]);
  const { fixed, templates } = messageTexts();
  for (const text of fixed) {
    assert.ok(literals.includes(text), `no message test for: ${text}`);
  }
  for (const template of templates) {
    assert.ok(literals.some((text) => matchesTemplate(template, text)), `no message test for: ${template}`);
  }
});

test('DOCS-7 the traceability table matches the story headings, the jobs and the role', () => {
  const jobs = read('docs', 'jobs-to-be-done.md');
  const roles = read('docs', 'app-roles.md');
  const headings = [...stories.matchAll(/^## (S-\d+) \(serves (J-\d+), (?:Implemented|Not implemented)\): /gm)]
    .map((match) => [match[1], match[2]]);
  const rows = [...stories.matchAll(/^\| (S-\d+) \| (J-\d+) \| (.+?) \|$/gm)]
    .map((match) => [match[1], match[2], match[3]]);
  assert.ok(headings.length > 0, 'no story headings found');
  assert.deepEqual(rows.map(([story, job]) => [story, job]), headings);
  const jobRoles = new Map([...jobs.matchAll(/^## (J-\d+) \((.+?)\): /gm)].map((match) => [match[1], match[2]]));
  const roleNames = [...roles.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  for (const [story, job, role] of rows) {
    assert.equal(jobRoles.get(job), role, `${story}: job ${job} belongs to a different role`);
    assert.ok(roleNames.includes(role), `${story}: role ${role} is not in the roles doc`);
  }
});

test('DOCS-8 the limits written in the messages match LIMITS', () => {
  function hundredths(text) {
    const [whole, fraction = ''] = text.split('.');
    return Number(whole) * 100 + Number((fraction + '00').slice(0, 2));
  }
  assert.equal(hundredths(/at least ([0-9.]+)\./.exec(messages.bill.min)[1]), LIMITS.billMinCents);
  assert.equal(hundredths(/more than ([0-9.]+)\./.exec(messages.bill.max)[1]), LIMITS.billMaxCents);
  assert.equal(Number(/more than ([0-9]+)%/.exec(messages.tip.max)[1]) * 100, LIMITS.tipMaxBasisPoints);
  assert.equal(Number(/at least ([0-9]+) person/.exec(messages.people.min)[1]), LIMITS.peopleMin);
  assert.equal(Number(/at most ([0-9]+) people/.exec(messages.people.max)[1]), LIMITS.peopleMax);
});

test('DOCS-9 every story has a valid status, and a status note naming its own criteria unless it is Implemented', () => {
  const sections = stories.split(/^## /m).slice(1).filter((section) => /^S-\d+ /.test(section));
  assert.ok(sections.length > 0, 'no stories found');
  for (const section of sections) {
    const heading = /^(S-\d+) \(serves (J-\d+), (Implemented|Not implemented)\): /.exec(section);
    assert.ok(heading !== null, `bad story heading: ${section.split('\n')[0]}`);
    const story = heading[1];
    const own = [...section.matchAll(new RegExp('^- (' + story + '\\.\\d+) ', 'gm'))].map((match) => match[1]);
    const note = /^Status note: (.*)$/m.exec(section);
    if (heading[3] === 'Implemented') {
      assert.equal(note, null, `${story} is Implemented but has a status note`);
      for (const id of own) {
        assert.ok(!NOT_BUILT.includes(id), `${story} is Implemented but ${id} is not built`);
      }
    } else {
      assert.ok(note !== null, `${story} is Not implemented but has no status note`);
      const named = [...note[1].matchAll(/S-\d+\.\d+/g)].map((match) => match[0]);
      assert.ok(named.length > 0, `${story}: the status note names no criteria`);
      for (const id of named) {
        assert.ok(own.includes(id), `${story}: the status note names ${id}, which is not one of its criteria`);
      }
    }
  }
});
