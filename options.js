const form = document.getElementById('webhookForm');
const list = document.getElementById('webhookList');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const label = document.getElementById('webhookLabel').value;
  const url = document.getElementById('webhookUrl').value;
  const includeUrl = document.getElementById('includeUrlCheckbox').checked;
  const showResult = document.getElementById('showResultCheckbox').checked;

  const webhook = {
    id: generateId(),
    label: label,
    url: url,
    includeUrl: includeUrl,
    showResult: showResult
  };

  chrome.storage.sync.get('webhooks', data => {
    const webhooks = data.webhooks || [];
    webhooks.push(webhook);
    chrome.storage.sync.set({ webhooks: webhooks }, updateWebhookList);
  });

  form.reset();
});

function updateWebhookList() {
  chrome.storage.sync.get('webhooks', data => {
    const webhooks = data.webhooks || [];
    list.innerHTML = ''; // Clear the list
    webhooks.forEach(webhook => {
      const webhookItem = document.createElement('div');
      webhookItem.className = 'webhook-item';
      webhookItem.textContent = `${webhook.label} - ${webhook.url}`;

      // Include URL checkbox with label (inline)
      const includeUrlDiv = document.createElement('div');
      includeUrlDiv.className = 'inline-checkbox';
      const includeUrlCheckbox = document.createElement('input');
      includeUrlCheckbox.type = 'checkbox';
      includeUrlCheckbox.checked = webhook.includeUrl;
      includeUrlCheckbox.addEventListener('change', () => updateIncludeUrl(webhook.id, includeUrlCheckbox.checked));
      const includeUrlLabel = document.createElement('label');
      includeUrlLabel.textContent = 'Include URL';
      includeUrlDiv.appendChild(includeUrlCheckbox);
      includeUrlDiv.appendChild(includeUrlLabel);

      // Show Result checkbox with label (inline)
      const showResultDiv = document.createElement('div');
      showResultDiv.className = 'inline-checkbox';
      const showResultCheckbox = document.createElement('input');
      showResultCheckbox.type = 'checkbox';
      showResultCheckbox.checked = webhook.showResult;
      showResultCheckbox.addEventListener('change', () => updateShowResult(webhook.id, showResultCheckbox.checked));
      const showResultLabel = document.createElement('label');
      showResultLabel.textContent = 'Show Result';
      showResultDiv.appendChild(showResultCheckbox);
      showResultDiv.appendChild(showResultLabel);

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => removeWebhook(webhook.id));

      // Append elements to the webhook item
      webhookItem.appendChild(includeUrlDiv);
      webhookItem.appendChild(showResultDiv);
      webhookItem.appendChild(removeBtn);

      // Append the webhook item to the list
      list.appendChild(webhookItem);
    });
  });
}

function updateIncludeUrl(id, includeUrl) {
  chrome.storage.sync.get('webhooks', data => {
    const webhooks = data.webhooks || [];
    const updatedWebhooks = webhooks.map(webhook => webhook.id === id ? { ...webhook, includeUrl } : webhook);
    chrome.storage.sync.set({ webhooks: updatedWebhooks }, updateWebhookList);
  });
}

function updateShowResult(id, showResult) {
  chrome.storage.sync.get('webhooks', data => {
    const webhooks = data.webhooks || [];
    const updatedWebhooks = webhooks.map(webhook => webhook.id === id ? { ...webhook, showResult } : webhook);
    chrome.storage.sync.set({ webhooks: updatedWebhooks }, updateWebhookList);
  });
}

function removeWebhook(id) {
  chrome.storage.sync.get('webhooks', data => {
    const webhooks = data.webhooks || [];
    const updatedWebhooks = webhooks.filter(webhook => webhook.id !== id);
    chrome.storage.sync.set({ webhooks: updatedWebhooks }, updateWebhookList);
  });
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

document.addEventListener('DOMContentLoaded', updateWebhookList);
