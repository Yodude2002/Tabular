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
    if (wi) {
        const newTab = translateTab(t);
        if (t.openerTabId !== undefined) {
            const before = wi.tabs.slice(0, t.index);
            const window = before.slice(before.findLastIndex((e) => e.parentId === -1), before.length);
            if (validParents(window).indexOf(t.openerTabId) < 0) {
                newTab.parentId = -1;
            } else {
                newTab.parentId = t.openerTabId;
            }
        }
        wi.tabs.splice(t.index, 0, newTab)
        wi.port.postMessage({
            message: "insert",
            globalIndex: t.index,
            tabInfo: newTab,
        } satisfies S2CMessage);
    }
});

chrome.tabs.onRemoved.addListener((id, removeInfo) => {
    const wi = windowStore[`${removeInfo.windowId}`];
    if (wi) {
        const index = wi.tabs.findIndex((t) => t.tabId === id);
        const [tab] = wi.tabs.splice(index, 1);
        for (const t of wi.tabs.filter((t) => t.parentId === tab.tabId)) {
            t.parentId = tab.parentId;
        }
        wi.port.postMessage({
            message: "remove",
            tabId: id,
        } satisfies S2CMessage);
    }
});

chrome.tabs.onUpdated.addListener((id, info, tab) => {
    const wi = windowStore[`${tab.windowId}`];
    if (wi) {
        const ti = wi.tabs.findIndex((t) => t.tabId === id);
        const t = wi.tabs[ti];
        wi.tabs[ti] = translateTab(tab);
        wi.tabs[ti].parentId = t.parentId;
        wi.port.postMessage({
            message: "update",
            tabInfo: wi.tabs[ti],
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
        windowStore[`${windowId}`] = {
            port: port,
            tabs: s
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

function validParents(tabs: Tab[]) {
    const stack: number[] = [];
    for (const tab of tabs) {
        if (tab.parentId === -1) {
            stack.splice(0, stack.length);
        } else {
            const index = stack.indexOf(tab.parentId);
            if (index < 0) {
                stack.splice(0, stack.length);
            } else {
                stack.splice(index+1, stack.length - index - 1);
            }
        }
        stack.push(tab.tabId)
    }
    return stack;
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