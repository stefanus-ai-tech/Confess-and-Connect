// =========================
// Element Selection
// =========================
const roleSelection = document.querySelector('.role-selection');
const listenerBtn = document.getElementById('listener-btn');
const confessorBtn = document.getElementById('confessor-btn');

const listenerSection = document.querySelector('.listener-section');
const backToRole1 = document.getElementById('back-to-role1');

const confessorSection = document.querySelector('.confessor-section');
const backToRole2 = document.getElementById('back-to-role2');

const chatBox = document.getElementById('chat-box');
const chatMessage = document.getElementById('chat-message');
const sendBtn = document.getElementById('send-btn');

const submitSolo = document.getElementById('submit-solo');

const soloMode = document.querySelector('.solo-mode');
const backFromSolo = document.getElementById('back-from-solo');

const burnText = document.getElementById('burn-text');
const burnAnimation = document.getElementById('burn-animation');

const confessionsList = document.getElementById('confessions-list');

// Initialize confessions as an in-memory array
let confessions = [];

// =========================
// Function Definitions
// =========================

/**
 * Renders confessions in the Listener's dashboard.
 */
function renderConfessions() {
  confessionsList.innerHTML = '';
  if (confessions.length === 0) {
    confessionsList.innerHTML = '<p>No confessions available.</p>';
    return;
  }
  confessions.forEach((confession, index) => {
    const confessionDiv = document.createElement('div');
    confessionDiv.classList.add('confession');
    confessionDiv.innerHTML = `
            <p>${confession.text}</p>
            <button data-index="${index}">I'm listening</button>
            <div class="notification">I'm listening</div>
        `;
    confessionsList.appendChild(confessionDiv);
  });

  // Add event listeners to buttons
  const buttons = confessionsList.querySelectorAll('button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const idx = button.getAttribute('data-index');
      const notification = button.nextElementSibling;
      notification.style.display = 'block';
      // Remove the confession after acknowledgment
      confessions.splice(idx, 1);
      renderConfessions();
    });
  });
}

/**
 * Appends a message to the chat box.
 * @param {string} message - The message text.
 * @param {string} sender - The sender identifier ('confessor' or 'listener').
 */
function appendMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);

  const bubbleDiv = document.createElement('div');
  bubbleDiv.classList.add('bubble');
  bubbleDiv.textContent = message;

  messageDiv.appendChild(bubbleDiv);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Handles sending a confession via the chat-like interface.
 */
function handleSendConfession() {
  const message = chatMessage.value.trim();
  if (message === '') {
    alert('Please enter a confession.');
    return;
  }

  // Append the confessor's message to the chat
  appendMessage(message, 'confessor');

  // Optionally, simulate a listener's response (can be removed if not needed)
  // setTimeout(() => {
  //     appendMessage('I hear you.', 'listener');
  // }, 1000);

  // Clear the input field
  chatMessage.value = '';
}

/**
 * Handles submitting the confession to Solo Mode.
 */
function handleSubmitSolo() {
  const messages = chatBox.querySelectorAll('.message.confessor .bubble');
  if (messages.length === 0) {
    alert('Please enter a confession before submitting to Solo Mode.');
    return;
  }

  // Combine all confessor messages into a single confession
  let confession = '';
  messages.forEach((msg) => {
    confession += msg.textContent + ' ';
  });
  confession = confession.trim();

  // Clear the chat box
  chatBox.innerHTML = '';

  // Add confession to confessions array (if you want to keep track)
  // confessions.push({ text: confession });
  // renderConfessions();

  // Proceed to Solo Mode
  confessorSection.classList.add('hidden');
  soloMode.classList.remove('hidden');

  // Insert confession text into burn-text element
  burnText.textContent = confession;

  // Start Solo Mode animation by showing the burn.gif
  burnAnimation.style.display = 'block';

  // Optionally, hide the burn.gif after animation completes (assuming burn.gif is 3 seconds long)
  setTimeout(() => {
    burnAnimation.style.display = 'none';
  }, 6000); // Duration matches the burnText animation (6s)
}

/**
 * Initializes event listeners.
 */
function initializeEventListeners() {
  // Role Selection Buttons
  listenerBtn.addEventListener('click', () => {
    roleSelection.classList.add('hidden');
    listenerSection.classList.remove('hidden');
    renderConfessions(); // Update confessions when Listener view is opened
  });

  confessorBtn.addEventListener('click', () => {
    roleSelection.classList.add('hidden');
    confessorSection.classList.remove('hidden');
  });

  // Back Buttons
  backToRole1.addEventListener('click', () => {
    listenerSection.classList.add('hidden');
    roleSelection.classList.remove('hidden');
  });

  backToRole2.addEventListener('click', () => {
    confessorSection.classList.add('hidden');
    roleSelection.classList.remove('hidden');
  });

  backFromSolo.addEventListener('click', () => {
    soloMode.classList.add('hidden');
    roleSelection.classList.remove('hidden');
    // Clear the burn text and hide burn animation
    burnText.textContent = '';
    burnAnimation.style.display = 'none';
  });

  // Send Button in Chat
  sendBtn.addEventListener('click', handleSendConfession);
  chatMessage.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendConfession();
    }
  });

  // Submit Solo Mode Button
  submitSolo.addEventListener('click', handleSubmitSolo);
}

// =========================
// Initialize the Application
// =========================
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
});
