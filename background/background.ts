import {S2CMessage} from "../common/protocol";

chrome.runtime.onInstalled.addListener((_details) => {
    // on install
})

chrome.runtime.onConnect.addListener((port) => {
    if (port.sender?.id === chrome.runtime.id) {
        handleNewConnection(port);
    }
})

function handleNewConnection(port: chrome.runtime.Port) {
    const windowId = parseInt(port.name);

    let tab = chrome.tabs.query({});
    tab.then((a1) => {

        let s = new Array<string>(a1.length);
        for(let i = 0; i < a1.length; i++) {
            s[i] = a1[i].title;
        }
        port.postMessage(s);

    });

    port.postMessage({ message: "ack" } as S2CMessage)
}

export const testExports = {
    handleNewConnection: handleNewConnection
}

