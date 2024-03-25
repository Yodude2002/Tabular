import {S2CMessage, C2SMessage, C2STabSelectMessage, Tab} from "../common/protocol";

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
            //if (i == 0)
                s[i] = translateTab(a1[i], a1[i]);
            //else
             //   s[i] = translateTab(a1[i], a1[i-1]);
            
            console.log(s[i]);
        }
        port.postMessage({ message: "state", tabs: s } satisfies S2CMessage);

    });

    port.postMessage({ message: "ack" } as S2CMessage)

    port.onMessage.addListener((a1: C2SMessage) => {

        if (a1.message == "select") {
            handleTabSelectMessage(a1);
        }
    });
}

function translateTab(tab: chrome.tabs.Tab, ltab: chrome.tabs.Tab): Tab {
    return {
        active: tab.active,
        audible: tab.audible ?? false,
        discardable: tab.autoDiscardable,
        discarded: tab.discarded,
        favicon: tab.favIconUrl ?? "",
        groupId: tab.groupId,
        highlighted: tab.highlighted,
        muted: tab.mutedInfo?.muted ?? false,
        parentId: findParentID(tab, ltab),
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

function handleTabSelectMessage(a1: C2STabSelectMessage){
    chrome.tabs.update(a1.tabId, {
        active: true
    }).catch((a2) => {
        console.error("Select tab did not work", a2)
    })
}

function findParentID(tab: chrome.tabs.Tab, ltabId: chrome.tabs.Tab) {
    if (tab.openerTabId == ltabId.id && tab.index > ltabId.index)
        return tab.openerTabId;
    else
        return -1;
}