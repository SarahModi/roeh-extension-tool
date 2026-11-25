document.addEventListener('DOMContentLoaded', () => {
  const scanButton = document.getElementById('scanPage');
  const scannedCount = document.getElementById('scannedCount');
  const warningCount = document.getElementById('warningCount');
  const status = document.getElementById('status');
  const message = document.getElementById('message');

  function showUnavailable() {
    status.textContent = 'Unavailable on this page';
    message.textContent = 'Open a regular website and try again. Browser-internal pages cannot be scanned.';
    scanButton.disabled = true;
  }

  function scan(action) {
    status.textContent = 'Checking…';
    message.textContent = '';
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      if (!tab?.id || !/^https?:/.test(tab.url || '')) return showUnavailable();
      chrome.tabs.sendMessage(tab.id, { action }, response => {
        if (chrome.runtime.lastError || !response?.ok) return showUnavailable();
        scannedCount.textContent = String(response.scanned);
        warningCount.textContent = String(response.warnings);
        status.textContent = 'Page checked';
        message.textContent = 'Warnings are heuristic signals, not proof of maliciousness. No warning does not mean a link is safe.';
      });
    });
  }

  scanButton.addEventListener('click', () => scan('rescanPage'));
  scan('getStats');
});
