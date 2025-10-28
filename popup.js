// Ro'eh Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scanPage');
    const protectedCount = document.getElementById('protectedCount');
    const threatsBlocked = document.getElementById('threatsBlocked');
    const statusElement = document.getElementById('status');

    // Update stats (for now we'll use mock data)
    function updateStats() {
        // In a real version, we'd get this from storage/API
        protectedCount.textContent = '247';
        threatsBlocked.textContent = '12';
        statusElement.textContent = 'Active';
        statusElement.style.color = '#10B981';
    }

    // Scan current page when button is clicked
    scanButton.addEventListener('click', function() {
        // Get the current active tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            
            // Send a message to the content script to rescan
            chrome.tabs.sendMessage(activeTab.id, {
                action: 'rescanPage'
            }, function(response) {
                if (response) {
                    // Show success feedback
                    scanButton.textContent = '✓ Scanning...';
                    scanButton.style.background = '#10B981';
                    
                    setTimeout(() => {
                        scanButton.textContent = '🔍 Scan This Page';
                        scanButton.style.background = '';
                    }, 1500);
                    
                    // Update stats
                    updateStats();
                } else {
                    // Handle case where content script isn't loaded
                    scanButton.textContent = '❌ Load page first';
                    setTimeout(() => {
                        scanButton.textContent = '🔍 Scan This Page';
                    }, 2000);
                }
            });
        });
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStats') {
            protectedCount.textContent = request.protectedCount || '0';
            threatsBlocked.textContent = request.threatsBlocked || '0';
        }
    });

    // Initialize popup with current stats
    updateStats();

    // Add some interactive feedback
    scanButton.addEventListener('mouseenter', function() {
        if (scanButton.textContent === '🔍 Scan This Page') {
            scanButton.style.transform = 'scale(1.02)';
        }
    });

    scanButton.addEventListener('mouseleave', function() {
        scanButton.style.transform = 'scale(1)';
    });
});

// Simple animation for the popup
document.body.style.animation = 'fadeIn 0.3s ease-in';

// Add the fadeIn animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
