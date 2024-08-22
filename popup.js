document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({ action: 'popupReady' });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'showPopup') {
            console.log('Received text in popup:', request.data);

            const container = document.getElementById('response-container');
            container.innerHTML = '';  // Clear any previous content

            const item = document.createElement('div');
            item.className = 'response-item';
            
            const responseText = document.createElement('span');
            responseText.textContent = request.data;
            responseText.className = 'response-text';

            const copyIcon = document.createElement('span');
            copyIcon.className = 'copy-icon';
            copyIcon.textContent = '📋';
            copyIcon.addEventListener('click', function () {
                navigator.clipboard.writeText(request.data).then(() => {
                    responseText.style.color = 'green';
                    setTimeout(() => {
                        responseText.style.color = 'black';
                        window.close();  // Close the popup window after copying
                    }, 500);  // Shorter delay before closing
                });
            });

            item.appendChild(responseText);
            item.appendChild(copyIcon);
            container.appendChild(item);
        }
    });
});
