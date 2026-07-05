
const GEMINI_API_KEY = "";
const OPENAI_API_KEY = "";

let activePersona = 'hitesh';
let chatHistories = {
  hitesh: [],
  piyush: []
};
let settings = {
  provider: 'gemini',
  geminiKey: '',
  openaiKey: '',
  geminiModel: 'gemini-2.5-flash',
  openaiModel: 'gpt-4o-mini',
  customPrompts: {
    hitesh: '',
    piyush: ''
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initUI();
  switchPersona('hitesh');
});

function loadSettings() {
  const savedSettings = localStorage.getItem('chaicode_simulator_settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      settings = { ...settings, ...parsed };
    } catch (e) {
      console.error("Error parsing saved settings", e);
    }
  }

  if (!settings.customPrompts.hitesh) {
    settings.customPrompts.hitesh = PERSONAS.hitesh.systemPrompt;
  }
  if (!settings.customPrompts.piyush) {
    settings.customPrompts.piyush = PERSONAS.piyush.systemPrompt;
  }

  const savedHistoryHitesh = localStorage.getItem('chaicode_history_hitesh');
  const savedHistoryPiyush = localStorage.getItem('chaicode_history_piyush');
  if (savedHistoryHitesh) {
    try { chatHistories.hitesh = JSON.parse(savedHistoryHitesh); } catch(e){}
  }
  if (savedHistoryPiyush) {
    try { chatHistories.piyush = JSON.parse(savedHistoryPiyush); } catch(e){}
  }
}

function saveSettings() {
  localStorage.setItem('chaicode_simulator_settings', JSON.stringify(settings));
}

function saveChatHistory(personaId) {
  localStorage.setItem(`chaicode_history_${personaId}`, JSON.stringify(chatHistories[personaId]));
}

function initUI() {

  const hiteshCard = document.getElementById('persona-card-hitesh');
  const piyushCard = document.getElementById('persona-card-piyush');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const configBtn = document.getElementById('config-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const settingsDrawer = document.getElementById('settings-drawer');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');

  document.getElementById('api-provider').value = settings.provider;
  document.getElementById('gemini-key').value = settings.geminiKey;
  document.getElementById('openai-key').value = settings.openaiKey;
  document.getElementById('gemini-model').value = settings.geminiModel;
  document.getElementById('openai-model').value = settings.openaiModel;

  toggleProviderFields(settings.provider);

  hiteshCard.addEventListener('click', () => switchPersona('hitesh'));
  piyushCard.addEventListener('click', () => switchPersona('piyush'));

  chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight - 4) + 'px';
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  sendBtn.addEventListener('click', handleSendMessage);

  configBtn.addEventListener('click', () => {
    settingsDrawer.classList.add('open');
  });

  closeDrawerBtn.addEventListener('click', () => {
    settingsDrawer.classList.remove('open');
  });

  document.getElementById('api-provider').addEventListener('change', (e) => {
    toggleProviderFields(e.target.value);
  });

  saveSettingsBtn.addEventListener('click', () => {
    settings.provider = document.getElementById('api-provider').value;
    settings.geminiKey = document.getElementById('gemini-key').value.trim();
    settings.openaiKey = document.getElementById('openai-key').value.trim();
    settings.geminiModel = document.getElementById('gemini-model').value;
    settings.openaiModel = document.getElementById('openai-model').value;

    saveSettings();
    showToast('Configuration saved successfully!', 'success');
    settingsDrawer.classList.remove('open');
  });

  clearChatBtn.addEventListener('click', () => {
    if (confirm(`Are you sure you want to clear the conversation history with ${PERSONAS[activePersona].name}?`)) {
      chatHistories[activePersona] = [];
      saveChatHistory(activePersona);
      renderChatTimeline();
      showToast('Chat history cleared', 'info');
    }
  });

}

function toggleProviderFields(provider) {
  const geminiFields = document.getElementById('gemini-fields');
  const openaiFields = document.getElementById('openai-fields');
  if (provider === 'gemini') {
    geminiFields.style.display = 'block';
    openaiFields.style.display = 'none';
  } else {
    geminiFields.style.display = 'none';
    openaiFields.style.display = 'block';
  }
}

function switchPersona(personaId) {
  activePersona = personaId;
  const p = PERSONAS[personaId];

  document.body.className = '';
  document.body.classList.add(p.themeClass);

  document.querySelectorAll('.persona-card').forEach(card => card.classList.remove('active'));
  document.getElementById(`persona-card-${personaId}`).classList.add('active');

  document.getElementById('header-avatar').src = p.avatar;
  document.getElementById('header-name').innerText = p.name;
  document.getElementById('header-status-text').innerText = p.status;

  renderChatTimeline();

  const chatInput = document.getElementById('chat-input');
  chatInput.value = '';
  chatInput.style.height = 'auto';

  showToast(`Switched to ${p.name}'s room`, 'info');
}

function renderChatTimeline() {
  const timeline = document.getElementById('chat-timeline');
  timeline.innerHTML = '';

  const messages = chatHistories[activePersona];

  if (messages.length === 0) {

    const welcomeHTML = `
      <div class="welcome-container">
        <div class="welcome-logo-badge">
          <img src="${PERSONAS[activePersona].avatar}" alt="${PERSONAS[activePersona].name}">
        </div>
        <h1 class="welcome-title">Chat with ${PERSONAS[activePersona].name}</h1>
        <p class="welcome-desc">${PERSONAS[activePersona].bio}</p>

        <div class="chips-section">
          <h2 class="chips-title">Suggested questions to ask:</h2>
          <div class="chips-grid">
            ${PERSONAS[activePersona].sampleQuestions.map(q => `
              <div class="chip-item" onclick="submitQuickQuestion('${q.text.replace(/'/g, "\\'")}')">
                <span class="chip-text">${q.label}</span>
                <span class="chip-arrow">&rarr;</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    timeline.innerHTML = welcomeHTML;
  } else {
    // Render Message bubble for each message in history
    messages.forEach(msg => {
      appendBubbleToTimeline(msg.role, msg.content, false);
    });
  }

  // Scroll to bottom
  timeline.scrollTop = timeline.scrollHeight;
}

// Submit a quick sample question clicked from chips
function submitQuickQuestion(text) {
  const chatInput = document.getElementById('chat-input');
  chatInput.value = text;
  handleSendMessage();
}

// Handle sending message
async function handleSendMessage() {
  const chatInput = document.getElementById('chat-input');
  const text = chatInput.value.trim();
  if (!text) return;

  // Clear input
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Check if API Key is configured
  const currentKey = settings.provider === 'gemini'
    ? (GEMINI_API_KEY || settings.geminiKey)
    : (OPENAI_API_KEY || settings.openaiKey);
  if (!currentKey) {
    // Append warning bubble and open settings
    appendBubbleToTimeline('user', text, true);
    appendSystemWarningBubble("API Key Missing! Please open the settings configuration panel (gear icon) in the bottom-left to paste your API key.");
    document.getElementById('config-btn').click();
    return;
  }

  // Append user bubble to timeline
  appendBubbleToTimeline('user', text, true);

  // Store in chatHistories
  chatHistories[activePersona].push({ role: 'user', content: text });
  saveChatHistory(activePersona);

  // Show Typing Indicator
  const typingIndicator = appendTypingIndicator();

  try {
    const aiResponse = await callLLMAPI(text);

    // Remove typing indicator
    typingIndicator.remove();

    // Append AI bubble to timeline
    appendBubbleToTimeline('model', aiResponse, true);

    // Save in chatHistories
    chatHistories[activePersona].push({ role: 'model', content: aiResponse });
    saveChatHistory(activePersona);
  } catch (error) {
    console.error(error);
    typingIndicator.remove();
    appendSystemWarningBubble(`Error generating response: ${error.message || 'Unknown network error'}. Please verify your API Key and connection.`);
  }
}

// Append message bubble directly to DOM
function appendBubbleToTimeline(role, text, shouldScroll = true) {
  const timeline = document.getElementById('chat-timeline');

  // Remove welcome screen if it exists
  const welcome = timeline.querySelector('.welcome-container');
  if (welcome) welcome.remove();

  const isUser = role === 'user';
  const name = isUser ? 'You' : PERSONAS[activePersona].name;
  const avatar = isUser ? 'assets/user.png' : PERSONAS[activePersona].avatar;

  const row = document.createElement('div');
  row.className = `message-row ${isUser ? 'user' : 'ai'}`;

  // Parse markdown formatting for model responses
  const parsedContent = isUser ? escapeHtml(text).replace(/\n/g, '<br>') : parseMarkdown(text);

  row.innerHTML = `
    <img class="message-sender-avatar" src="${avatar}" alt="${name}">
    <div class="message-content-wrapper">
      <span class="message-sender-name">${name}</span>
      <div class="message-bubble">
        ${parsedContent}
      </div>
    </div>
  `;

  timeline.appendChild(row);

  if (shouldScroll) {
    timeline.scrollTop = timeline.scrollHeight;
  }
}

// Append Warning Message bubble
function appendSystemWarningBubble(text) {
  const timeline = document.getElementById('chat-timeline');
  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.innerHTML = `
    <div class="message-content-wrapper" style="max-width: 100%;">
      <span class="message-sender-name" style="color: #ef4444;">System Warning</span>
      <div class="message-bubble" style="border-color: rgba(239, 68, 68, 0.4); background-color: rgba(239, 68, 68, 0.05); color: #fca5a5;">
        ${text}
      </div>
    </div>
  `;
  timeline.appendChild(row);
  timeline.scrollTop = timeline.scrollHeight;
}

// Append Typing indicator to timeline
function appendTypingIndicator() {
  const timeline = document.getElementById('chat-timeline');
  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.innerHTML = `
    <img class="message-sender-avatar" src="${PERSONAS[activePersona].avatar}" alt="${PERSONAS[activePersona].name}">
    <div class="message-content-wrapper">
      <span class="message-sender-name">${PERSONAS[activePersona].name}</span>
      <div class="message-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  timeline.appendChild(row);
  timeline.scrollTop = timeline.scrollHeight;
  return row;
}

// Helper to escape HTML tags for security
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Robust Markdown-to-HTML parser
function parseMarkdown(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Match and format fenced code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
  html = html.replace(codeBlockRegex, (match, lang, code) => {
    const language = lang || 'javascript';
    return `<div class="code-block-wrapper">
      <div class="code-header">
        <span class="code-lang">${language}</span>
        <button class="copy-code-btn" onclick="copyToClipboard(this)">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.524 3h-2.048a2.25 2.25 0 0 0-2.143 1.888m7.29 0A2.25 2.25 0 0 1 18 6v12a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 6 18V6c0-.98.626-1.813 1.5-2.112m7.29 0a3 3 0 0 0-4.593 0m0 0a3 3 0 0 1 4.593 0" /></svg>
          Copy
        </button>
      </div>
      <pre><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  const lines = html.split('\n');
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const listMatch = lines[i].match(/^[\*\-]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        lines[i] = '<ul><li>' + listMatch[1] + '</li>';
        inList = true;
      } else {
        lines[i] = '<li>' + listMatch[1] + '</li>';
      }
    } else {
      if (inList) {
        lines[i - 1] = lines[i - 1] + '</ul>';
        inList = false;
      }
    }
  }
  if (inList) {
    lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
  }
  html = lines.join('\n');

  html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');

  return html;
}

window.copyToClipboard = function(button) {
  const codeBlock = button.closest('.code-block-wrapper').querySelector('code');
  if (codeBlock) {
    navigator.clipboard.writeText(codeBlock.innerText).then(() => {
      const originalText = button.innerHTML;
      button.innerHTML = 'Copied!';
      button.style.color = '#10b981';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.color = '';
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

async function callLLMAPI(promptText) {

  const rawHistory = chatHistories[activePersona];
  const conversationHistory = rawHistory.slice(-10);

  const activeSystemPrompt = PERSONAS[activePersona].systemPrompt;

  if (settings.provider === 'gemini') {
    return await callGeminiAPI(promptText, conversationHistory, activeSystemPrompt);
  } else {
    return await callOpenAIAPI(promptText, conversationHistory, activeSystemPrompt);
  }
}

async function callGeminiAPI(promptText, history, systemPrompt) {
  const apiKey = GEMINI_API_KEY || settings.geminiKey;
  const model = settings.geminiModel || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [];

  history.forEach(msg => {

    const role = msg.role === 'user' ? 'user' : 'model';
    contents.push({
      role: role,
      parts: [{ text: msg.content }]
    });
  });

  const requestBody = {
    contents: contents,
    systemInstruction: {
      parts: {
        text: systemPrompt
      }
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  const candidates = data.candidates || [];
  if (candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
    return candidates[0].content.parts[0].text;
  } else {
    throw new Error('Empty response received from Gemini API');
  }
}

async function callOpenAIAPI(promptText, history, systemPrompt) {
  const apiKey = OPENAI_API_KEY || settings.openaiKey;
  const model = settings.openaiModel || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  history.forEach(msg => {
    const role = msg.role === 'user' ? 'user' : 'assistant';
    messages.push({
      role: role,
      content: msg.content
    });
  });

  const requestBody = {
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 1024
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  const choices = data.choices || [];
  if (choices.length > 0 && choices[0].message?.content) {
    return choices[0].message.content;
  } else {
    throw new Error('Empty response received from OpenAI API');
  }
}
