const { test } = require('node:test');
const assert = require('node:assert/strict');
const { analyzeLink } = require('../link-analyzer.js');

test('flags a brand name in an untrusted domain', () => {
  assert.equal(analyzeLink('https://amazon-login.example/').verdict, 'dangerous');
});

test('flags a one-character brand lookalike', () => {
  assert.equal(analyzeLink('https://paypa1.example/').verdict, 'suspicious');
});

test('recognizes official domain and its subdomain without substring confusion', () => {
  assert.equal(analyzeLink('https://www.amazon.com/').verdict, 'no-warning');
  assert.equal(analyzeLink('https://evilamazon.com/').verdict, 'dangerous');
});

test('warns on a known shortener and direct IP destination', () => {
  assert.equal(analyzeLink('https://bit.ly/abc').verdict, 'suspicious');
  assert.equal(analyzeLink('http://192.0.2.1/login').verdict, 'suspicious');
});

test('does not label non-web schemes as safe', () => {
  assert.equal(analyzeLink('mailto:hello@example.com').verdict, 'ignored');
});

test('returns an explicit result for malformed input', () => {
  assert.equal(analyzeLink('not a url').verdict, 'suspicious');
});
