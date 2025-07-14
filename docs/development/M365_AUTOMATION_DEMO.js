// IntelliPy M365 Copilot Browser Automation Demo
// This script will automatically fill the chat box and click send

// Example of what the automation script does:
(function() {
    console.log('🤖 IntelliPy M365 Copilot Automation Demo');
    
    // 1. Find the chat input box (tries multiple selectors)
    const chatSelectors = [
        'textarea[placeholder*="Ask me anything"]',
        'textarea[placeholder*="Type a message"]',
        'div[contenteditable="true"]',
        'textarea[aria-label*="Type a message"]',
        '#searchbox textarea'
    ];
    
    // 2. Insert the query text
    const exampleQuery = "Help me write a Python function to calculate factorial";
    
    // 3. Find and click the send button
    const sendSelectors = [
        'button[aria-label*="Send"]',
        'button[title*="Send"]', 
        'button[type="submit"]',
        '.send-button'
    ];
    
    console.log('📝 Query to be inserted:', exampleQuery);
    console.log('🔍 Will search for chat input using selectors:', chatSelectors);
    console.log('🚀 Will search for send button using selectors:', sendSelectors);
    console.log('✅ This automation eliminates manual copy-paste workflow!');
})();

/* 
HOW TO USE THE REAL AUTOMATION:

1. Install IntelliPy v1.1.1
2. Run "IntelliPy: Select AI Provider" → Choose "Microsoft 365 Copilot"
3. When prompted, choose "🤖 Use Auto-Insert Script" 
4. The extension will:
   - Open M365 Copilot in browser
   - Generate automation script for your specific query
   - Copy script to clipboard
   - Guide you through running it in browser console
   
5. In M365 Copilot browser tab:
   - Press F12 (Developer Tools)
   - Click Console tab
   - Paste the script (Ctrl+V)
   - Press Enter
   - Watch as it automatically fills chat box and clicks send!

RESULT: Near-complete automation of M365 Copilot interaction!
*/
