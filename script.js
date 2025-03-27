// Session ID for the current chat
const sessionId = generateSessionId();

// Store user's name if they provide it
let userName = '';

// Conversation memory to provide context
const conversationMemory = {};

// Store topics mentioned for better context tracking
let recentTopics = [];

// Object to store topic-specific responses
const botResponses = {
    "mental_health": [
        "💭 It's important to take care of your mental health. Have you tried any relaxation techniques lately?",
        "🧠 I understand things can be challenging sometimes. Would you like to share more about how you're feeling?",
        "😌 Taking small breaks throughout the day can really help with stress. Do you have any favorite ways to unwind?",
        "🌱 Self-care isn't selfish, it's necessary. What's one small thing you could do today to take care of yourself?",
        "🤗 Sharing your feelings with others can be really helpful. Do you have someone you trust that you can talk to?"
    ],
    "feeling_sad": [
        "🫂 I'm sorry to hear you're feeling sad. Sometimes just acknowledging those feelings can be the first step. Would you like to talk more about it?",
        "💙 It's okay to feel sad sometimes. Would it help to talk about what's causing these feelings?",
        "🌧️ Sadness is a natural emotion we all experience. Is there something specific that's bringing you down today?",
        "🕯️ When I feel down, sometimes doing something small and comforting can help. Do you have any comfort activities?",
        "🌈 Even in difficult times, remember that feelings change and improve with time. Would you like to share what's on your mind?"
    ],
    "feeling_anxious": [
        "🧘 Anxiety can feel overwhelming sometimes. Deep breathing can help in the moment - would you like to try it together?",
        "🌬️ When anxiety hits, grounding exercises can help. Try naming 5 things you can see right now. What do you notice?",
        "🪴 Anxiety is your body's alert system - it's trying to protect you. What seems to be triggering these feelings?",
        "💫 Taking things one small step at a time can help with anxiety. What's one tiny thing you could focus on right now?",
        "🕊️ You're not alone in feeling anxious. Many people experience it. Would you like to talk about what's causing your anxiety?"
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
    // Initialize conversation memory
    conversationMemory[sessionId] = [];
    
    // Set up event listeners
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Focus on input field
    document.getElementById('message-input').focus();
    
    // Add initial greeting
    setTimeout(() => {
        const initialGreeting = botResponses["greeting"][Math.floor(Math.random() * botResponses["greeting"].length)];
        addMessageToChat(initialGreeting, 'bot');
    }, 500);
});

/**
 * Sends a user message and gets a response
 */
function sendMessage() {
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
    
    // Update recent topics list (keep last 3)
    recentTopics.unshift(topic);
    if (recentTopics.length > 3) {
        recentTopics.pop();
    }
    
    // Get responses for the detected topic
    const responses = botResponses[topic] || botResponses['default'];
    
    // Choose a random response from the available options
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Personalize the response if we know the user's name
    if (userName) {
        // 50% chance to include the name for a more natural conversation
        if (Math.random() > 0.5) {
            if (response.includes('?')) {
                response = response.replace(/\?/, `, ${userName}?`);
            } else {
                // If the response doesn't end with a question mark, find a good place to insert the name
                const sentences = response.split('. ');
                if (sentences.length > 1) {
                    sentences[1] = `${userName}, ` + sentences[1].charAt(0).toLowerCase() + sentences[1].slice(1);
                    response = sentences.join('. ');
                } else {
                    response = `${userName}, ` + response.charAt(0).toLowerCase() + response.slice(1);
                }
            }
        }
    }
    
    // Store the interaction in conversation memory
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
            const potentialName = match[1];
            // Avoid capturing common words as names
            const commonWords = ['sad', 'happy', 'ok', 'okay', 'fine', 'good', 'bad', 'depressed', 'anxious', 'stressed'];
            if (!commonWords.includes(potentialName.toLowerCase())) {
                // Capitalize first letter
                userName = potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
                break;
            }
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
            // But not if it's a greeting
            if (!lowerMessage.match(/\b(hi|hello|hey|greetings|howdy)\b/)) {
                return lastInteraction.topic;
            }
        }
        
        // Check for references to previous topics
        if (lowerMessage.includes('that') || 
            lowerMessage.includes('it') || 
            lowerMessage.includes('this')) {
            return lastInteraction.topic;
        }
    }
    
    // Check for emotional states first (these take priority)
    if (lowerMessage.match(/\b(sad|feeling down|depressed|unhappy|miserable|upset|crying|tears)\b/) || 
        lowerMessage.match(/\b(i am sad|i'm sad|i feel sad|i'm feeling sad|feel sad)\b/)) {
        return 'feeling_sad';
    }
    
    if (lowerMessage.match(/\b(anxious|anxiety|worried|nervous|stress|stressed|panic|fear|afraid|scared)\b/) ||
        lowerMessage.match(/\b(i am anxious|i'm anxious|i feel anxious|i'm feeling anxious)\b/)) {
        return 'feeling_anxious';
    }
    
    // Topic detection based on keywords
    if (lowerMessage.match(/\b(mental|health|therapy|counseling)\b/)) {
        return 'mental_health';
    }
    
    // Check for social media references
    if (lowerMessage.match(/\b(social|media|facebook|instagram|twitter|tiktok|online|internet|post|like|comment|share|follower)\b/)) {
        return 'social_media';
    }
    
    // Check for positive attitude topics
    if (lowerMessage.match(/\b(positive|happy|joy|grateful|thankful|appreciate|optimist|hope)\b/)) {
        return 'positive_attitude';
    }
    
    // Check for well-being topics
    if (lowerMessage.match(/\b(well|being|wellness|healthy|exercise|nutrition|sleep|meditate|mindful)\b/)) {
        return 'well_being';
    }
    
    // Check for gaming topics
    if (lowerMessage.match(/\b(game|gaming|play|video|console|pc|nintendo|xbox|playstation|steam)\b/)) {
        return 'gaming';
    }
    
    // Check for greetings (but only at the beginning of conversation)
    if (lowerMessage.match(/\b(hi|hello|hey|greetings|howdy|morning|afternoon|evening)\b/)) {
        if (conversationMemory[sessionId].length === 0) {
            return 'greeting';
        }
    }
    
    // If we have recent topics and no new topic was detected, use the most recent non-default topic
    if (recentTopics.length > 0) {
        for (const topic of recentTopics) {
            if (topic !== 'default' && topic !== 'greeting') {
                // 50% chance to continue with the recent topic
                if (Math.random() > 0.5) {
                    return topic;
                }
                break;
            }
        }
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