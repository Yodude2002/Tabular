import {S2CMessage, Tab} from "../common/protocol";

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

        let s = new Array<Tab>(a1.length);
        for(let i = 0; i < a1.length; i++) {
            s[i] = translateTab(a1[i]);
        }
        port.postMessage({ message: "state", tabs: s } satisfies S2CMessage);

    });

    port.postMessage({ message: "ack" } as S2CMessage)
}

function translateTab(tab: chrome.tabs.Tab): Tab {
    return {
        active: tab.active,
        audible: tab.audible ?? false,
        discardable: tab.autoDiscardable,
        discarded: tab.discarded,
        favicon: tab.favIconUrl ?? "",
        groupId: tab.groupId,
        highlighted: tab.highlighted,
        muted: tab.mutedInfo?.muted ?? false,
        parentId: -1,
        pinned: tab.pinned,
        tabId: tab.id ?? 0,
        title: tab.title ?? "",
        url: tab.url ?? "",
        windowId: tab.windowId

    }
}

export const testExports = {
    handleNewConnection: handleNewConnection
}

