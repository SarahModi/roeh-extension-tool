// Ro'eh - Digital Oxygen
// Main content script that scans pages for links

console.log('Ro\'eh is protecting this page...');

// Scan all links on the page
function scanLinks() {
    const links = document.querySelectorAll('a[href]');
    let scannedCount = 0;
    
    links.forEach(link => {
        // Skip if we already added a safety dot
        if (link.hasAttribute('data-roeh-scanned')) return;
        
        const safety = analyzeLink(link.href);
        addSafetyIndicator(link, safety);
        link.setAttribute('data-roeh-scanned', 'true');
        scannedCount++;
    });
    
    if (scannedCount > 0) {
        console.log(`🛡️ Ro'eh scanned ${scannedCount} links`);
    }
}

// Analyze a single link - THIS IS YOUR PHISHING DETECTION LOGIC!
function analyzeLink(url) {
    try {
        const domain = new URL(url).hostname.toLowerCase();
        
        // 🚨 DANGEROUS: Obvious phishing patterns
        if (
            domain.includes('amaz0n') || 
            domain.includes('paypa1') ||
            domain.includes('netfl1x') ||
            domain.includes('micr0soft') ||
            domain.includes('faceb00k') ||
            domain.includes('apple1d') ||
            domain.includes('verify-login') ||
            domain.includes('security-update') ||
            url.includes('login-verify') ||
            url.includes('account-confirm')
        ) {
            return 'dangerous';
        }
        
        // ⚠️ SUSPICIOUS: New domains, URL shorteners
        if (
            domain.endsWith('.tk') ||
            domain.endsWith('.ml') ||
            domain.endsWith('.ga') ||
            domain.includes('bit.ly') ||
            domain.includes('tinyurl') ||
            domain.includes('shortener') ||
            url.length > 100 // Very long URLs
        ) {
            return 'suspicious';
        }
        
        // ✅ SAFE: Legitimate domains
        if (
            domain.includes('amazon.com') ||
            domain.includes('paypal.com') ||
            domain.includes('netflix.com') ||
            domain.includes('microsoft.com') ||
            domain.includes('google.com') ||
            domain.includes('github.com') ||
            domain.includes('facebook.com')
        ) {
            return 'safe';
        }
        
        return 'safe'; // Default to safe
        
    } catch (error) {
        console.log('Ro\'eh: Error analyzing link', error);
        return 'suspicious'; // When in doubt, be cautious
    }
}

// Add visual safety indicator next to a link
function addSafetyIndicator(link, safety) {
    const dot = document.createElement('span');
    dot.className = `roeh-safety-dot roeh-${safety}`;
    
    // Add tooltip with explanation
    const tooltip = document.createElement('span');
    tooltip.className = 'roeh-tooltip';
    
    if (safety === 'dangerous') {
        tooltip.textContent = 'Dangerous: Possible phishing link';
    } else if (safety === 'suspicious') {
        tooltip.textContent = 'Suspicious: Use caution';
    } else {
        tooltip.textContent = 'Safe: Verified link';
    }
    
    dot.appendChild(tooltip);
    
    // Insert the dot after the link
    link.parentNode.insertBefore(dot, link.nextSibling);
}

// Scan when page loads
document.addEventListener('DOMContentLoaded', scanLinks);

// Scan when new content is added (for dynamic pages like Gmail)
const observer = new MutationObserver(scanLinks);
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial scan
setTimeout(scanLinks, 1000);
