/**
 * Chatbot Agent Logic - White Label Utility
 * SaaS-Ready for Cloudflare Pages Deployment
 */

// 1. DYNAMIC BRANDING CONFIGURATION
const BOT_CONFIG = {
    name: "CS Virtual",
    status: "Online",
    avatarUrl: "https://picsum.photos/seed/bot/150/150"
};

// DOM References
const chatArea = document.getElementById('chat-area');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const typingTemplate = document.getElementById('typing-template');

// Initialize Branding
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('bot-name').textContent = BOT_CONFIG.name;
    document.getElementById('bot-status').textContent = BOT_CONFIG.status;
    document.getElementById('bot-avatar').src = BOT_CONFIG.avatarUrl;
    document.title = `${BOT_CONFIG.name} - Chatbot Support`;
});

// 2. STATE MANAGEMENT & ASYNC FLOW
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    // Send user message to UI
    appendMessage(messageText, 'user');
    chatInput.value = '';
    
    // Toggle Loading State
    toggleInputState(true);
    const typingIndicator = showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });

        if (!response.ok) throw new Error('Proxy error');

        const data = await response.json();
        const botResponse = data.output || data.text || data.message || "Maaf, respon tidak valid.";
        
        removeTypingIndicator(typingIndicator);
        appendMessage(botResponse, 'bot');
        
    } catch (error) {
        console.error("Fetch Error:", error);
        removeTypingIndicator(typingIndicator);
        appendMessage("Maaf, sistem kami sedang sibuk. Silakan coba beberapa saat lagi.", 'bot');
    } finally {
        toggleInputState(false);
    }
});

// 3. HELPERS (DRY PRINCIPLE)

/**
 * Appends a chat bubble to the chat area safely (Zero-XSS)
 */
function appendMessage(text, sender) {
    const wrapper = document.createElement('div');
    wrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} message-bubble`;

    const bubble = document.createElement('div');
    // Tailwind classes based on sender
    const userClasses = "bg-indigo-600 text-white rounded-2xl rounded-tr-none";
    const botClasses = "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100";
    
    bubble.className = `max-w-[80%] px-4 py-3 shadow-sm ${sender === 'user' ? userClasses : botClasses}`;
    
    // STRICT SECURITY: Use textContent to prevent XSS
    const p = document.createElement('p');
    p.className = "text-sm leading-relaxed whitespace-pre-wrap break-words";
    p.textContent = text;
    
    bubble.appendChild(p);
    wrapper.appendChild(bubble);
    chatArea.appendChild(wrapper);
    
    // Scroll to bottom
    scrollToBottom();
}

function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}

function toggleInputState(disabled) {
    chatInput.disabled = disabled;
    sendButton.disabled = disabled;
    if (!disabled) chatInput.focus();
}

function showTypingIndicator() {
    const clone = typingTemplate.content.cloneNode(true);
    const indicator = clone.querySelector('.typing-indicator');
    chatArea.appendChild(clone);
    scrollToBottom();
    return indicator;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}
