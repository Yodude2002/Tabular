import {
    S2CMessage,
    C2SMessage,
    C2STabSelectMessage,
    Tab,
    C2SRemoveMessage
} from "../common/protocol";

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

    let tab = chrome.tabs.query({
        windowId: windowId
    });
    tab.then((a1) => {

        let s = new Array<Tab>(a1.length);
        for(let i = 0; i < a1.length; i++) {
            s[i] = translateTab(a1[i]);
        }
        assignParents(s, a1);
        port.postMessage({ message: "state", tabs: s } satisfies S2CMessage);

    });

    chrome.tabs.onCreated.addListener((t) => {
        if (t.windowId === windowId) {
            port.postMessage({
                message: "insert",
                globalIndex: t.index,
                tabInfo: translateTab(t)
            } satisfies S2CMessage)
        }
    });
    chrome.tabs.onRemoved.addListener((id, removeInfo) => {
        if (removeInfo.windowId === windowId) {
            port.postMessage({
                message: "remove",
                tabId: id,
            } satisfies S2CMessage)
        }
    })
    chrome.tabs.onUpdated.addListener((id, info, tab) => {
        if (tab.windowId === windowId) {
            port.postMessage({
                message: "update",
                tabInfo: translateTab(tab)
            } satisfies S2CMessage)
        }
    })

    port.onMessage.addListener((a1: C2SMessage) => {

        switch (a1.message) {
            case "select":
                handleTabSelectMessage(a1);
                break;
            case "remove":
                handleTabRemoveMessage(a1);
                break;
        }
    });
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
        windowId: tab.windowId,
    }
}

function assignParents(tabs: Tab[], native: chrome.tabs.Tab[]) {
    const stack: number[] = [];
    for(let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const ct = native[i];
        if (ct.openerTabId === undefined) {
            stack.splice(0, stack.length);
        } else {
            const index = stack.indexOf(ct.openerTabId);
            if (index < 0) {
                stack.splice(0, stack.length);
            } else {
                stack.splice(index + 1, stack.length - index - 1);
                tab.parentId = ct.openerTabId;
            }
        }
        stack.push(tab.tabId);
    }
}

function handleTabSelectMessage(a1: C2STabSelectMessage){
    chrome.tabs.update(a1.tabId, {
        active: true
    }).catch((a2) => {
        console.error("Select tab did not work", a2)
    })
}

function handleTabRemoveMessage(a1: C2SRemoveMessage) {
    chrome.tabs.remove(a1.tabId).catch(console.error);
}

export const testExports = {
    handleNewConnection: handleNewConnection,
    translateTab: translateTab,
    handleTabSelectMessage: handleTabSelectMessage,
    handleTabRemoveMessage: handleTabRemoveMessage,
}