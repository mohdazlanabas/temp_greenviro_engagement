/* ========================================
   Greenviro Farewell Site - Scripts
   ========================================
   
   NOTE FOR PRODUCTION DEPLOYMENT:
   This implementation uses localStorage for demo purposes.
   For persistence across different users/devices, consider:
   1. Firebase Realtime Database (free tier available)
   2. Supabase (free tier available)
   3. A simple Node.js/Express backend on Digital Ocean
   4. JSONbin.io or similar free JSON storage API
   
   ======================================== */

// Configuration
const CONFIG = {
    MAX_MESSAGES: 100,
    MAX_MESSAGE_LENGTH: 200,
    STORAGE_KEY: 'greenviro_messages',
    VISITOR_COUNT_KEY: 'greenviro_visitor_count',
    VISITOR_ID_KEY: 'greenviro_visitor_id'
};

// DOM Elements
const elements = {
    visitorCount: document.getElementById('visitorCount'),
    visitorLocation: document.getElementById('visitorLocation'),
    visitorTime: document.getElementById('visitorTime'),
    visitorName: document.getElementById('visitorName'),
    visitorMessage: document.getElementById('visitorMessage'),
    charCount: document.getElementById('charCount'),
    sendBtn: document.getElementById('sendBtn'),
    messagesContainer: document.getElementById('messagesContainer'),
    noMessages: document.getElementById('noMessages')
};

/* ========================================
   Visitor Tracking Functions
   ======================================== */

// Generate unique visitor ID
function generateVisitorId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Track visitor and update count
function trackVisitor() {
    let visitorId = localStorage.getItem(CONFIG.VISITOR_ID_KEY);
    let visitorCount = parseInt(localStorage.getItem(CONFIG.VISITOR_COUNT_KEY)) || 0;
    
    // If new visitor, increment count
    if (!visitorId) {
        visitorId = generateVisitorId();
        localStorage.setItem(CONFIG.VISITOR_ID_KEY, visitorId);
        visitorCount++;
        localStorage.setItem(CONFIG.VISITOR_COUNT_KEY, visitorCount.toString());
    }
    
    elements.visitorCount.textContent = visitorCount;
}

// Get visitor location using IP geolocation API
async function getVisitorLocation() {
    try {
        // Using a free IP geolocation API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.city && data.country_name) {
            elements.visitorLocation.textContent = `${data.city}, ${data.country_name}`;
        } else if (data.country_name) {
            elements.visitorLocation.textContent = data.country_name;
        } else {
            elements.visitorLocation.textContent = 'Location unavailable';
        }
    } catch (error) {
        console.log('Could not fetch location:', error);
        elements.visitorLocation.textContent = 'Location unavailable';
    }
}

// Update current time
function updateVisitorTime() {
    const now = new Date();
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    elements.visitorTime.textContent = now.toLocaleDateString('en-MY', options);
}

/* ========================================
   Messages Functions
   ======================================== */

// Get all messages from storage
function getMessages() {
    try {
        const messages = localStorage.getItem(CONFIG.STORAGE_KEY);
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('Error reading messages:', error);
        return [];
    }
}

// Save messages to storage
function saveMessages(messages) {
    try {
        // Keep only the last MAX_MESSAGES
        const trimmedMessages = messages.slice(-CONFIG.MAX_MESSAGES);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(trimmedMessages));
        return true;
    } catch (error) {
        console.error('Error saving messages:', error);
        return false;
    }
}

// Add a new message
function addMessage(name, text) {
    const messages = getMessages();
    
    const newMessage = {
        id: Date.now(),
        name: name.trim(),
        text: text.trim(),
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    if (saveMessages(messages)) {
        return newMessage;
    }
    return null;
}

// Format timestamp for display
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-MY', options);
}

// Create message HTML element
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = 'message-item';
    div.innerHTML = `
        <p class="message-text">${escapeHtml(message.text)}</p>
        <div class="message-meta">
            <span class="message-author">— ${escapeHtml(message.name)}</span>
            <span class="message-time">${formatTimestamp(message.timestamp)}</span>
        </div>
    `;
    return div;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render all messages
function renderMessages() {
    const messages = getMessages();
    
    if (messages.length === 0) {
        elements.noMessages.style.display = 'block';
        return;
    }
    
    elements.noMessages.style.display = 'none';
    
    // Clear existing messages (except the no-messages element)
    const existingMessages = elements.messagesContainer.querySelectorAll('.message-item');
    existingMessages.forEach(el => el.remove());
    
    // Render messages in reverse order (newest first)
    messages.reverse().forEach(message => {
        const messageEl = createMessageElement(message);
        elements.messagesContainer.appendChild(messageEl);
    });
}

/* ========================================
   Toast Notification
   ======================================== */

function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ========================================
   Event Handlers
   ======================================== */

// Handle character count
function handleCharacterCount() {
    const length = elements.visitorMessage.value.length;
    elements.charCount.textContent = length;
    
    // Visual feedback when approaching limit
    if (length > 180) {
        elements.charCount.style.color = '#C62828';
    } else if (length > 150) {
        elements.charCount.style.color = '#FF8F00';
    } else {
        elements.charCount.style.color = '';
    }
}

// Handle send button click
function handleSend() {
    const name = elements.visitorName.value.trim();
    const message = elements.visitorMessage.value.trim();
    
    // Validation
    if (!name) {
        showToast('Please enter your name', 'error');
        elements.visitorName.focus();
        return;
    }
    
    if (!message) {
        showToast('Please enter your message', 'error');
        elements.visitorMessage.focus();
        return;
    }
    
    if (message.length > CONFIG.MAX_MESSAGE_LENGTH) {
        showToast(`Message too long (max ${CONFIG.MAX_MESSAGE_LENGTH} characters)`, 'error');
        return;
    }
    
    // Check message limit
    const messages = getMessages();
    if (messages.length >= CONFIG.MAX_MESSAGES) {
        showToast('Maximum number of messages reached', 'error');
        return;
    }
    
    // Add message
    const newMessage = addMessage(name, message);
    
    if (newMessage) {
        // Clear form
        elements.visitorName.value = '';
        elements.visitorMessage.value = '';
        elements.charCount.textContent = '0';
        
        // Re-render messages
        renderMessages();
        
        // Show success toast
        showToast('Your message has been sent! 🎉');
        
        // Scroll to messages section
        document.querySelector('.messages-display-section').scrollIntoView({
            behavior: 'smooth'
        });
    } else {
        showToast('Failed to send message. Please try again.', 'error');
    }
}

/* ========================================
   Initialization
   ======================================== */

function init() {
    // Track visitor
    trackVisitor();
    
    // Get location
    getVisitorLocation();
    
    // Update time
    updateVisitorTime();
    setInterval(updateVisitorTime, 60000); // Update every minute
    
    // Render existing messages
    renderMessages();
    
    // Event listeners
    elements.visitorMessage.addEventListener('input', handleCharacterCount);
    elements.sendBtn.addEventListener('click', handleSend);
    
    // Allow Enter key to submit (Shift+Enter for new line)
    elements.visitorMessage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    
    // Enter key on name field moves to message
    elements.visitorName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elements.visitorMessage.focus();
        }
    });
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/* ========================================
   Optional: Add sample messages for demo
   Uncomment the following to add demo messages
   ======================================== */

/*
function addSampleMessages() {
    const samples = [
        { name: 'Team Member', text: 'Best wishes on your new journey! It was great working with you.' },
        { name: 'Colleague', text: 'Thank you for all the memories. Wishing you success!' }
    ];
    
    const messages = getMessages();
    if (messages.length === 0) {
        samples.forEach((sample, index) => {
            setTimeout(() => {
                addMessage(sample.name, sample.text);
                renderMessages();
            }, index * 100);
        });
    }
}
addSampleMessages();
*/
