# Ro'eh — Link Safety (prototype)

Ro'eh is a small Chrome Manifest V3 extension prototype that adds an inline indicator beside web links matching a handful of explainable warning heuristics. It is an educational portfolio project—not a security product, reputation service, or malware scanner.

## What it does

- Checks HTTP(S) links locally in the browser; it does not send URLs to a server.
- Flags selected lookalike/brand-containing domains, URL shorteners, punycode, direct IP links, embedded credentials, and unusually long URLs.
- Adds a reason to each indicator's accessible label and tooltip.
- Watches dynamically added page content and supports a manual rescan from the popup.

**Important limitation:** the rules are intentionally small and can miss phishing links or flag benign ones. “No warning” means only that none of these local rules matched; it does not mean a URL is safe or verified. Do not rely on Ro'eh to make security decisions.

## Install locally

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Select **Load unpacked** and choose the repository directory.
4. Open an ordinary HTTP(S) webpage and click the Ro'eh toolbar icon.

Chrome internal pages, extension stores, and some protected pages do not permit content scripts. The extension requests only `activeTab`; its content script is limited to HTTP(S) pages. No build step or external service is required.

## Development and tests

Requires Node.js 18 or newer. The analyzer is intentionally independent of browser APIs and can be tested with Node's built-in runner:

```sh
node --test
```

Manual smoke test: load unpacked, visit a page containing links to `https://paypa1.example/` and `https://example.com/`, open the popup, and verify counts and inline indicators. Then add a link dynamically and use **Rescan this page**.

## Design notes

- `link-analyzer.js` owns the explainable URL heuristics and is covered by unit tests.
- `content.js` annotates links and observes dynamic page changes.
- `popup.js` requests real per-page scan counts from the active tab; values are not fabricated or persisted.
- The extension does not block navigation. Indicators are informational only.

## Privacy and permissions

Analysis runs locally in the browser. The manifest uses `activeTab` for popup access to the selected tab and injects the content script only on HTTP(S) pages. No analytics, storage, remote calls, or account data are used.

## Portfolio status

A small, transparent prototype demonstrating browser-extension APIs, DOM mutation handling, accessible UI feedback, explainable heuristics, and unit tests. It is not production-grade phishing protection; stronger detection would require carefully selected threat-intelligence data, evaluation against labeled examples, ongoing updates, and false-positive/false-negative measurement.
