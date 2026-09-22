(function () {
  'use strict';

  const FALLBACK_DELAY_MS = 1800;
  const ID_PATTERN = /^[A-Za-z0-9_-]{6,512}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isAllowedMeetingUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && (url.hostname === 'webex.com' || url.hostname.endsWith('.webex.com'));
    } catch {
      return false;
    }
  }

  function parseTarget(search) {
    const params = new URLSearchParams(search);
    const space = (params.get('space') || '').trim();
    const message = (params.get('message') || '').trim();
    const email = (params.get('email') || '').trim();
    const meeting = (params.get('meeting') || '').trim();
    const groups = [Boolean(space), Boolean(email), Boolean(meeting)].filter(Boolean).length;

    if (groups !== 1) throw new Error('Provide exactly one of: space, email, or meeting.');
    if (message && !space) throw new Error('A message ID requires a space ID.');

    if (space) {
      if (!ID_PATTERN.test(space)) throw new Error('The space ID is not valid.');
      if (message && !ID_PATTERN.test(message)) throw new Error('The message ID is not valid.');
      const native = new URL('webexteams://im');
      native.searchParams.set('space', space);
      if (message) native.searchParams.set('message', message);
      const web = new URL('https://web.webex.com/spaces/' + encodeURIComponent(space));
      if (message) web.searchParams.set('message', message);
      return { kind: message ? 'message' : 'space', native: native.href, web: web.href };
    }

    if (email) {
      if (email.length > 254 || !EMAIL_PATTERN.test(email)) throw new Error('The email address is not valid.');
      const native = new URL('webexteams://im');
      native.searchParams.set('email', email);
      const web = new URL('https://web.webex.com/');
      web.searchParams.set('email', email);
      return { kind: 'direct message', native: native.href, web: web.href };
    }

    if (!isAllowedMeetingUrl(meeting)) throw new Error('Meeting must be an HTTPS URL on webex.com.');
    const native = new URL('webexteams://meet');
    native.searchParams.set('url', meeting);
    return { kind: 'meeting', native: native.href, web: meeting };
  }

  function launch(target) {
    const title = document.getElementById('title');
    const status = document.getElementById('status');
    const actions = document.getElementById('actions');
    const appLink = document.getElementById('open-app');
    const webLink = document.getElementById('open-web');
    let timer;
    let pageHidden = false;

    appLink.href = target.native;
    webLink.href = target.web;
    actions.hidden = false;
    title.textContent = 'Opening Webex…';
    status.textContent = 'If the app does not open, this page will continue in your browser.';

    const cancelFallback = () => {
      pageHidden = true;
      if (timer) window.clearTimeout(timer);
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelFallback();
    }, { once: true });
    window.addEventListener('pagehide', cancelFallback, { once: true });
    window.addEventListener('blur', cancelFallback, { once: true });

    timer = window.setTimeout(() => {
      if (!pageHidden && !document.hidden) window.location.replace(target.web);
    }, FALLBACK_DELAY_MS);

    // Assigning the custom scheme from a direct page load is the most broadly
    // compatible approach across current Safari, Chrome, Edge, iOS and Android.
    window.location.href = target.native;
  }

  function showError(message) {
    document.getElementById('title').textContent = 'Webex link needs attention';
    document.getElementById('status').textContent = message;
    document.getElementById('actions').hidden = true;
  }

  function setupGenerator() {
    const form = document.getElementById('generator');
    const kind = document.getElementById('kind');
    const value = document.getElementById('value');
    const message = document.getElementById('message');
    const messageLabel = document.getElementById('message-label');
    const output = document.getElementById('generated');

    function sync() {
      const isSpace = kind.value === 'space';
      message.hidden = messageLabel.hidden = !isSpace;
      value.placeholder = isSpace ? 'Space ID' : kind.value === 'email' ? 'person@example.com' : 'https://company.webex.com/meet/…';
    }
    kind.addEventListener('change', sync);
    sync();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      url.searchParams.set(kind.value, value.value.trim());
      if (kind.value === 'space' && message.value.trim()) url.searchParams.set('message', message.value.trim());
      try {
        parseTarget(url.search);
        output.textContent = url.href;
      } catch (error) {
        output.textContent = error.message;
      }
    });
  }

  function init() {
    setupGenerator();
    if (!window.location.search) {
      document.getElementById('title').textContent = 'Webex link bridge';
      document.getElementById('status').textContent = 'Use a safe HTTPS link to open a Webex space, message, direct chat, or meeting.';
      return;
    }
    try {
      launch(parseTarget(window.location.search));
    } catch (error) {
      showError(error.message);
    }
  }

  if (typeof module !== 'undefined') module.exports = { parseTarget, isAllowedMeetingUrl };
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', init);
})();
