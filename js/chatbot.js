// js/chatbot.js

document.addEventListener('DOMContentLoaded', function () {
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatMessages = document.querySelector('.chat-messages');

  // Chatbot functionality
  chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });

  sendChatBtn.addEventListener('click', sendChatMessage);

  function sendChatMessage() {
    const question = chatInput.value.trim();
    if (question !== '') {
      displayChatbotMessage(question, 'user');
      processChatbotQuestion(question);
      chatInput.value = '';
    }
  }

  function processChatbotQuestion(question) {
    // logic to answer questions typed by the user.
  }

  function displayChatbotMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});