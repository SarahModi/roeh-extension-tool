/* Ro'eh page annotator. Runs only on HTTP(S) pages declared in manifest.json. */
(() => {
  'use strict';
  const analyzer = globalThis.RoehLinkAnalyzer;
  if (!analyzer) return;

  const MARKER = 'data-roeh-scanned';
  let scheduled = false;

  function scanLinks() {
    let scanned = 0;
    let warnings = 0;
    document.querySelectorAll('a[href]').forEach(link => {
      if (link.hasAttribute(MARKER)) return;
      const result = analyzer.analyzeLink(link.href);
      link.setAttribute(MARKER, 'true');
      if (result.verdict === 'ignored') return;
      scanned++;
      if (result.verdict === 'dangerous' || result.verdict === 'suspicious') warnings++;

      const indicator = document.createElement('span');
      indicator.className = `roeh-safety-dot roeh-${result.verdict}`;
      indicator.setAttribute('role', 'img');
      indicator.setAttribute('aria-label', `Ro'eh: ${result.reason}`);
      indicator.title = `Ro'eh: ${result.reason}`;
      indicator.dataset.roehIndicator = 'true';
      link.insertAdjacentElement('afterend', indicator);
    });
    return { scanned, warnings };
  }

  function rescan() {
    const stats = scanLinks();
    return { ok: true, ...stats };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action === 'rescanPage' || message?.action === 'getStats') {
      sendResponse(rescan());
    }
  });

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      scanLinks();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scanLinks();
})();
