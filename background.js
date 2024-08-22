// Function to create context menus
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'parent',
      title: 'SolidState Media Generator',
      contexts: ['selection']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error creating parent context menu:', chrome.runtime.lastError);
      } else {
        console.log('Parent context menu created');
      }
    });
    updateContextMenus();
  });
}

// Set up context menus on extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  createContextMenus();
});

// Set up context menus when the extension is started or reloaded
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  createContextMenus();
});

// Update context menus based on the webhooks stored in sync storage
function updateContextMenus() {
  chrome.storage.sync.get('webhooks', data => {
    const webhooks = data.webhooks || [];
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'parent',
        title: 'SolidState Media Generator',
        contexts: ['selection']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error creating parent context menu:', chrome.runtime.lastError);
        } else {
          console.log('Parent context menu created');
        }
      });

      webhooks.forEach(webhook => {
        chrome.contextMenus.create({
          id: webhook.id,
          parentId: 'parent',
          title: webhook.label,
          contexts: ['selection']
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error creating submenu for', webhook.label, ':', chrome.runtime.lastError);
          } else {
            console.log('Submenu created for', webhook.label);
          }
        });
      });
    });
  });
}

// Handle clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu item clicked:', info.menuItemId, info.parentMenuItemId);
  if (info.parentMenuItemId === 'parent') {
    console.log('Handling click event for menu item:', info.menuItemId);
    chrome.storage.sync.get('webhooks', data => {
      const webhooks = data.webhooks || [];
      const webhook = webhooks.find(item => item.id === info.menuItemId);
      if (webhook) {
        const urlWithParams = webhook.url + (webhook.includeUrl ? `?url=${encodeURIComponent(tab.url)}` : '');
        console.log('Sending data to webhook:', urlWithParams, 'with text:', info.selectionText);

        fetch(urlWithParams, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: info.selectionText  // Send the selected text directly
        })
        .then(response => response.text())  // Get plain text response
        .then(responseText => {
          console.log('Response from webhook:', responseText);

          // Show popup only if "Show Result" is checked
          if (webhook.showResult) {
            chrome.windows.create({
              url: chrome.runtime.getURL('popup.html'),
              type: 'popup',
              width: 300,
              height: 400,
              top: 100,
              left: 1000,
              focused: true
            }, function(window) {
              console.log('Popup window created:', window);
              chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (request.action === 'popupReady') {
                  console.log('Popup is ready, sending response text:', responseText);
                  chrome.runtime.sendMessage({ action: 'showPopup', data: responseText });
                }
              });
            });
          } else {
            console.log('Popup not shown because "Show Result" is unchecked.');
          }
        })
        .catch(error => console.error('Error fetching data from webhook:', error));
      }
    });
  }
});

// Recreate context menus when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.webhooks) {
    console.log('Webhooks changed', changes);
    createContextMenus();
  }
});
