const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTarget, isAllowedMeetingUrl } = require('../bridge.js');

test('builds a space target with an optional message', () => {
  const target = parseTarget('?space=abc123_def&message=msg987_xyz');
  assert.equal(target.kind, 'message');
  assert.match(target.native, /^webexteams:\/\/im\?/);
  assert.match(target.native, /space=abc123_def/);
  assert.match(target.native, /message=msg987_xyz/);
  assert.equal(target.web, 'https://web.webex.com/spaces/abc123_def?message=msg987_xyz');
});

test('builds a direct-message target', () => {
  const target = parseTarget('?email=person%40example.com');
  assert.match(target.native, /^webexteams:\/\/im\?/);
  assert.match(target.native, /person%40example.com/);
});

test('allows only HTTPS Webex meeting hosts', () => {
  assert.equal(isAllowedMeetingUrl('https://company.webex.com/meet/person'), true);
  assert.equal(isAllowedMeetingUrl('https://webex.com/meet/person'), true);
  assert.equal(isAllowedMeetingUrl('https://webex.com.evil.example/meet/person'), false);
  assert.equal(isAllowedMeetingUrl('javascript:alert(1)'), false);
});

test('rejects ambiguous and malformed targets', () => {
  assert.throws(() => parseTarget('?space=abc123&email=a%40b.com'));
  assert.throws(() => parseTarget('?message=abc123'));
  assert.throws(() => parseTarget('?space=%3Cscript%3E'));
});
