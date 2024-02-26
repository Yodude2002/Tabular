

chrome.runtime.onInstalled.addListener((_details) => {
    // on install
})

chrome.runtime.onConnect.addListener((port) => {
    if (port.sender?.id === chrome.runtime.id) {
        const windowId = parseInt(port.name);

        port.postMessage({ message: "ack" } as S2CMessage)
    }
})