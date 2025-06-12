const assert = require('assert');
const {test} = require('node:test');
const {createHash} = require('crypto');
const {machineId, machineIdSync} = require('../dist/index');

const platform = process.platform;
const originalPattern = {
  darwin: /^[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}$/,
  win32: /^[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}$/,
  linux: /^[0-9A-Za-z]{32}$/,
  freebsd: /^[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}$/
};
const hashPattern = /^[0-9A-Za-z]{64}$/;

test('machineIdSync(true) returns original unique id', () => {
  const id = machineIdSync(true);
  assert.match(id, originalPattern[platform]);
});

test('machineId(true) returns the same original id', async () => {
  const asyncId = await machineId(true);
  const syncId = machineIdSync(true);
  assert.strictEqual(asyncId, syncId);
  assert.match(asyncId, originalPattern[platform]);
});

test('machineIdSync() returns sha256 hash of the original id', () => {
  const original = machineIdSync(true);
  const expected = createHash('sha256').update(original).digest('hex');
  const hashed = machineIdSync();
  assert.match(hashed, hashPattern);
  assert.strictEqual(hashed, expected);
});

test('machineId() returns sha256 hash of the original id', async () => {
  const original = await machineId(true);
  const expected = createHash('sha256').update(original).digest('hex');
  const hashed = await machineId();
  assert.match(hashed, hashPattern);
  assert.strictEqual(hashed, expected);
});

test('CommonJS import exposes machineId functions', () => {
  const mod = require('../dist/index');
  assert.strictEqual(typeof mod.machineId, 'function');
  assert.strictEqual(typeof mod.machineIdSync, 'function');
});
