/* Local, explainable link heuristics. A clean result is not a guarantee of safety. */
(function (root) {
  'use strict';

  const KNOWN_BRANDS = [
    { name: 'amazon', domains: ['amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de', 'amazon.co.jp'] },
    { name: 'apple', domains: ['apple.com'] },
    { name: 'facebook', domains: ['facebook.com'] },
    { name: 'google', domains: ['google.com', 'google.co.uk', 'google.ca', 'google.de'] },
    { name: 'github', domains: ['github.com'] },
    { name: 'microsoft', domains: ['microsoft.com', 'microsoftonline.com'] },
    { name: 'netflix', domains: ['netflix.com'] },
    { name: 'paypal', domains: ['paypal.com'] }
  ];
  const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', ' ow.ly'.trim(), 'is.gd', 'buff.ly', 'rebrand.ly']);

  function editDistanceAtMostOne(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0;
    let j = 0;
    let edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    if (i < a.length || j < b.length) edits++;
    return edits <= 1;
  }

  function analyzeLink(input) {
    let url;
    try { url = new URL(input); } catch { return { verdict: 'suspicious', reason: 'Invalid URL' }; }
    if (!['http:', 'https:'].includes(url.protocol)) return { verdict: 'ignored', reason: 'Not a web link' };

    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    const labels = host.split('.');
    if (url.username || url.password) return { verdict: 'dangerous', reason: 'URL contains embedded login credentials' };
    if (host.startsWith('xn--') || labels.some(label => label.startsWith('xn--'))) {
      return { verdict: 'suspicious', reason: 'Internationalized domain (punycode) needs extra scrutiny' };
    }
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':')) {
      return { verdict: 'suspicious', reason: 'Link points directly to an IP address' };
    }
    if (SHORTENERS.has(host)) return { verdict: 'suspicious', reason: 'URL shortener hides the destination' };
    if (input.length > 200) return { verdict: 'suspicious', reason: 'Unusually long URL' };

    for (const brand of KNOWN_BRANDS) {
      if (brand.domains.some(domain => host === domain || host.endsWith(`.${domain}`))) {
        return { verdict: 'no-warning', reason: 'No configured domain warning matched' };
      }
      const brandLabel = labels.find(label => label.includes(brand.name));
      if (brandLabel) return { verdict: 'dangerous', reason: `Untrusted domain contains the brand name “${brand.name}”` };
      const closeLabel = labels.find(label => editDistanceAtMostOne(label, brand.name));
      if (closeLabel) return { verdict: 'suspicious', reason: `Domain is very similar to “${brand.name}”` };
    }
    return { verdict: 'no-warning', reason: 'No configured warning pattern matched' };
  }

  const api = { analyzeLink };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RoehLinkAnalyzer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
