document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.querySelector('.clear-chat');

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';

        // Enable/disable send button
        sendButton.disabled = this.value.trim() === '';
    });

    // Handle Enter key
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Suggestion buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-btn')) {
            const question = e.target.getAttribute('data-question');
            messageInput.value = question;
            messageInput.focus();
            sendButton.disabled = false;
            // Auto-send the suggested question
            setTimeout(() => sendMessage(), 100);
        }
    });

    // Clear chat
    clearChatBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the conversation?')) {
            // Remove all messages except welcome message
            const messages = chatMessages.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());

            // Show welcome message again
            const welcomeMsg = chatMessages.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.style.display = 'flex';
            }
        }
    });

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Hide welcome message
        const welcomeMsg = chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.style.display = 'none';
        }

        // Add user message
        addMessage(message, 'user');

        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        sendButton.disabled = true;

        // Show typing indicator
        showTypingIndicator();

        // Send POST request
        sendToAPI(message);
    }

    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatar = document.createElement('div');
        if (type === 'user') {
            avatar.className = 'user-avatar';
            avatar.textContent = 'U';
        } else {
            avatar.className = 'agent-avatar';
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
        }

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = formatMessage(content);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function formatMessage(content) {
        // Basic formatting for better readability
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendToAPI(message) {
        try {
            console.log('Sending message:', message);
            console.log('API URL:', 'https://ethandu.app.n8n.cloud/webhook/5177bccb-7de7-4510-b3c0-a4d2522e9a18');

            const requestBody = {
                message: message,
                timestamp: new Date().toISOString()
            };
            console.log('Request body:', requestBody);

            const response = await fetch('https://ethandu.app.n8n.cloud/webhook/5177bccb-7de7-4510-b3c0-a4d2522e9a18', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            hideTypingIndicator();

            if (!response.ok) {
                console.error('HTTP error response:', response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            // Get response as text first to see what we're dealing with
            const responseText = await response.text();
            console.log('Raw response text:', responseText);

            // Try to parse as JSON
            let responseData;
            try {
                responseData = JSON.parse(responseText);
                console.log('Parsed response data:', responseData);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                console.log('Treating response as plain text');
                responseData = responseText;
            }

            // Extract message from response
            let aiResponse;

            // Handle array response format
            if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].answer) {
                aiResponse = responseData[0].answer;
                console.log('Using array format answer:', aiResponse);
            }
            // Handle object response formats
            else if (typeof responseData === 'object' && responseData !== null) {
                if (responseData.answer) {
                    aiResponse = responseData.answer;
                    console.log('Using object answer:', aiResponse);
                } else if (responseData.message) {
                    aiResponse = responseData.message;
                    console.log('Using object message:', aiResponse);
                } else if (responseData.response) {
                    aiResponse = responseData.response;
                    console.log('Using object response:', aiResponse);
                } else {
                    console.log('Object response has no recognized fields:', Object.keys(responseData));
                    aiResponse = "I received your message but couldn't process it properly. Could you try asking again?";
                }
            }
            // Handle string response
            else if (typeof responseData === 'string') {
                aiResponse = responseData;
                console.log('Using string response:', aiResponse);
            }
            // Fallback
            else {
                console.log('Unknown response format:', typeof responseData, responseData);
                aiResponse = "I received your message but couldn't process it properly. Could you try asking again?";
            }

            // Add AI response
            addMessage(aiResponse, 'ai');

        } catch (error) {
            console.error('Full error details:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            hideTypingIndicator();

            let errorMessage = "I'm sorry, I'm having trouble connecting right now. ";

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += "This might be a network or CORS issue. ";
            } else if (error.message.includes('HTTP error')) {
                errorMessage += `Server responded with error: ${error.message}. `;
            }

            errorMessage += "Please check the browser console for more details and try again.";

            addMessage(errorMessage, 'ai');
        }
    }

    // Auto-focus on input when page loads
    messageInput.focus();
});