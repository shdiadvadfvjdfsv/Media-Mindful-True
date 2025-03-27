// Session ID for the current chat
const sessionId = generateSessionId();

// Store user's name if they provide it
let userName = '';

// Conversation memory to provide context
const conversationMemory = {};

// Object to store topic-specific responses
const botResponses = {
    "mental_health": [
        "💭 It's important to take care of your mental health. Have you tried any relaxation techniques lately?",
        "🧠 Remember that it's okay to not be okay sometimes. Would you like to talk more about how you're feeling?",
        "😌 Taking small breaks throughout the day can really help with stress. Do you have any favorite ways to unwind?",
        "🌱 Self-care isn't selfish, it's necessary. What's one small thing you could do today to take care of yourself?",
        "🤗 Sharing your feelings with others can be really helpful. Do you have someone you trust that you can talk to?"
    ],
    "social_media": [
        "📱 Social media can be both connecting and overwhelming. How do you feel it affects you?",
        "👥 Finding a balance with social media can be tricky. Have you tried setting time limits for apps?",
        "🔔 Notification overload is real! Have you considered turning off non-essential notifications?",
        "🌐 Social media showcases highlight reels, not reality. It's important to remember that when scrolling.",
        "💬 Online interactions are different from face-to-face ones. Do you notice any differences in how you communicate?"
    ],
    "positive_attitude": [
        "☀️ Starting the day with a positive thought can set the tone. Do you have any morning rituals?",
        "😊 Finding small moments of joy throughout the day adds up! What's something small that made you smile today?",
        "🙏 Practicing gratitude can shift our perspective. Is there something you're grateful for right now?",
        "🌈 Even cloudy days have silver linings. What's a positive aspect of a challenging situation you're facing?",
        "💪 You're stronger than you think! What's a challenge you've overcome that you're proud of?"
    ],
    "well_being": [
        "🧘 Balance between work and rest is essential for well-being. How do you find that balance?",
        "💤 Quality sleep is so important! Do you have a bedtime routine that helps you rest well?",
        "🏃 Movement can boost our mood significantly. Have you enjoyed any physical activity lately?",
        "🥦 Nourishing our bodies affects how we feel. What's your favorite healthy meal?",
        "🌿 Spending time in nature can be very restorative. Do you have a favorite outdoor spot?"
    ],
    "gaming": [
        "🎮 Gaming can be a great way to relax and have fun! What games have you been enjoying lately?",
        "🕹️ Some games can be really social experiences. Do you prefer playing with friends or solo gaming?",
        "🏆 The sense of achievement in games can be really satisfying. What's a gaming accomplishment you're proud of?",
        "⏱️ It's easy to lose track of time while gaming! Do you have any strategies for balancing game time with other activities?",
        "🎲 Games exercise different skills - problem-solving, creativity, reflexes. What skills do your favorite games help you develop?"
    ],
    "greeting": [
        "👋 Hello! I'm Buddy Bot. How are you doing today?",
        "🌟 Hi there! It's great to chat with you. How's your day going?",
        "😊 Hey! I'm Buddy Bot, your friendly AI chat companion. What's on your mind?",
        "👋 Hello! I'm here to chat about anything that's on your mind. How are you feeling today?",
        "🌈 Hi! I'm Buddy Bot. I'd love to know how you're doing today!"
    ],
    "default": [
        "I'm not sure I understand that completely. Could you tell me more?",
        "That's interesting! Could you elaborate a bit more so I can better respond?",
        "I'd like to hear more about that. Could you share a bit more detail?",
        "I'm learning as we chat. Could you explain a bit more about what you mean?",
        "I want to make sure I understand correctly. Could you share a bit more about that?"
    ]
};

// Initialize the chat with a greeting
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Focus on input field
    document.getElementById('message-input').focus();
});

/**
 * Sends a user message and gets a response
 */
async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    // Display user message
    addMessageToChat(message, 'user');
    
    // Clear input field
    messageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process the message and get response
    setTimeout(() => {
        removeTypingIndicator();
        
        // Get bot response
        const botResponse = processMessage(message);
        addMessageToChat(botResponse, 'bot');
        
        // Scroll to bottom
        scrollToBottom();
    }, 1000 + Math.random() * 1000); // Random delay for natural feel
}

/**
 * Process the user message and determine appropriate response
 */
function processMessage(message) {
    // Extract user info (like their name)
    extractUserInfo(message);
    
    // Detect topic from the message
    const topic = getTopicFromMessage(message);
    
    // Get responses for the detected topic
    const responses = botResponses[topic] || botResponses['default'];
    
    // Choose a random response from the available options
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Personalize the response if we know the user's name
    if (userName) {
        // 50% chance to include the name for a more natural conversation
        if (Math.random() > 0.5) {
            response = response.replace('?', `, ${userName}?`);
            
            // If the response doesn't end with a question mark, prepend the name
            if (!response.includes('?')) {
                const firstSentence = response.split('.')[0] + '.';
                const restOfResponse = response.substring(firstSentence.length);
                response = `${userName}, ${firstSentence.toLowerCase()}${restOfResponse}`;
            }
        }
    }
    
    // Store the interaction in conversation memory
    if (!conversationMemory[sessionId]) {
        conversationMemory[sessionId] = [];
    }
    
    conversationMemory[sessionId].push({
        user: message,
        bot: response,
        topic: topic,
        timestamp: new Date().toISOString()
    });
    
    return response;
}

/**
 * Extract and store user information from messages
 */
function extractUserInfo(message) {
    // Try to extract name
    const namePatterns = [
        /my name is (\w+)/i,
        /i am (\w+)/i,
        /i'm (\w+)/i,
        /call me (\w+)/i
    ];
    
    for (const pattern of namePatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            // Capitalize first letter
            userName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            break;
        }
    }
}

/**
 * Get topic from the message for contextual responses
 */
function getTopicFromMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for follow-up questions
    if (conversationMemory[sessionId] && conversationMemory[sessionId].length > 0) {
        const lastInteraction = conversationMemory[sessionId][conversationMemory[sessionId].length - 1];
        
        // If the message is very short, it might be a follow-up
        if (message.split(' ').length < 4) {
            return lastInteraction.topic;
        }
        
        // Check for references to previous topics
        if (lowerMessage.includes('that') || 
            lowerMessage.includes('it') || 
            lowerMessage.includes('this')) {
            return lastInteraction.topic;
        }
    }
    
    // Topic detection based on keywords
    if (lowerMessage.match(/\b(mental|health|anxiety|stress|depress|therapy|counseling)\b/)) {
        return 'mental_health';
    }
    
    if (lowerMessage.match(/\b(social media|facebook|instagram|twitter|tiktok|online|internet|post|like|comment|share|follower)\b/)) {
        return 'social_media';
    }
    
    if (lowerMessage.match(/\b(positive|happy|joy|grateful|thankful|appreciate|optimist|hope)\b/)) {
        return 'positive_attitude';
    }
    
    if (lowerMessage.match(/\b(well-being|wellness|healthy|exercise|nutrition|sleep|meditate|mindful)\b/)) {
        return 'well_being';
    }
    
    if (lowerMessage.match(/\b(game|gaming|play|video game|console|pc game|nintendo|xbox|playstation|steam)\b/)) {
        return 'gaming';
    }
    
    if (lowerMessage.match(/\b(hi|hello|hey|greetings|howdy|good morning|good afternoon|good evening)\b/)) {
        return 'greeting';
    }
    
    return 'default';
}

/**
 * Adds a message to the chat
 */
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = formatMessage(message);
    
    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);
    
    scrollToBottom();
}

/**
 * Format message text with basic styling
 */
function formatMessage(text) {
    // Replace URLs with links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Replace *text* with bold
    text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Replace _text_ with italic
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    return text;
}

/**
 * Shows typing indicator
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        indicator.appendChild(dot);
    }
    
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

/**
 * Removes typing indicator
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Scrolls chat to bottom
 */
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Generate a random session ID
 */
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15);
}