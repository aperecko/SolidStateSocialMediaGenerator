chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showPopup') {
    showPopup(request.data);
  }
});

function showPopup(data) {
  const popup = document.createElement('div');
  popup.id = 'webhook-response-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #ccc;
    padding: 20px;
    z-index: 9999;
    max-width: 300px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  `;

  let content = '<h3>Webhook Response</h3>';
  for (const [key, value] of Object.entries(data)) {
    content += `<p><strong>${key}:</strong> ${value}</p>`;
  }

  content += '<a href="#" id="close-popup">Close</a>';
  popup.innerHTML = content;

  document.body.appendChild(popup);

  document.getElementById('close-popup').addEventListener('click', (e) => {
    e.preventDefault();
    document.body.removeChild(popup);
  });
}