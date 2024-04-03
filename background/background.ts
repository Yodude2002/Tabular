import {
    S2CMessage,
    C2SMessage,
    C2STabSelectMessage,
    Tab,
    C2SRemoveMessage
} from "../common/protocol";

type WindowInfo = {
    port: chrome.runtime.Port,
    tabs: Tab[],
}

declare global {
    var windowStore: {
        [key in `${number}`]?: WindowInfo
    };
}

chrome.runtime.onInstalled.addListener((_details) => {
    // on install
    if (!globalThis.windowStore) {
        globalThis.windowStore = {};
    }
})

chrome.runtime.onConnect.addListener((port) => {
    if (port.sender?.id === chrome.runtime.id) {
        handleNewConnection(port);
    }
})

chrome.tabs.onCreated.addListener((t) => {
    const wi = windowStore[`${t.windowId}`];
    if (wi) { // TODO: update the tabs
        wi.port.postMessage({
            message: "insert",
            globalIndex: t.index,
            tabInfo: translateTab(t),
        } satisfies S2CMessage);
    }
});

chrome.tabs.onRemoved.addListener((id, removeInfo) => {
    const wi = windowStore[`${removeInfo.windowId}`];
    if (wi) { // TODO: update the tabs
        wi.port.postMessage({
            message: "remove",
            tabId: id,
        } satisfies S2CMessage);
    }
});

chrome.tabs.onUpdated.addListener((id, info, tab) => {
    const wi = windowStore[`${tab.windowId}`];
    if (wi) { // TODO: update the tabs
        wi.port.postMessage({
            message: "update",
            tabInfo: translateTab(tab),
        } satisfies S2CMessage);
    }
});

function handleNewConnection(port: chrome.runtime.Port) {
    const windowId = parseInt(port.name);

    let tab = chrome.tabs.query({
        windowId: windowId
    });
    tab.then((a1) => {
        const s = a1.map(translateTab);
        assignParents(s, a1);
        const wi = windowStore[`${windowId}`];
        if (wi) {
            wi.tabs = s
        }
        port.postMessage({ message: "state", tabs: s } satisfies S2CMessage);
    });

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
    port.onDisconnect.addListener((_p) => {
        delete windowStore[`${windowId}`];
    })

    windowStore[`${windowId}`] = {
        port: port,
        tabs: []
    }
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