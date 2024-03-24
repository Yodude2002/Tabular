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
            s[i] = translateTab(a1[i], a1);
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

function translateTab(tab: chrome.tabs.Tab, tabArray: chrome.tabs.Tab[]): Tab {
    return {
        active: tab.active,
        audible: tab.audible ?? false,
        discardable: tab.autoDiscardable,
        discarded: tab.discarded,
        favicon: tab.favIconUrl ?? "",
        groupId: tab.groupId,
        highlighted: tab.highlighted,
        muted: tab.mutedInfo?.muted ?? false,
        parentId: findParentID(tab, tabArray) ?? -1,
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

function findParentID(tab: chrome.tabs.Tab, tabArray: chrome.tabs.Tab[]) {
    let s = 0;
    for (let i = 0; i < tabArray.length; i++) {
        if (tabArray[i].id == tab.id) {
            s = i-1;
        }
    }
    
    if (tabArray[s].id > 0){
    if (tab.openerTabId == tabArray[s].id)
    return tab.openerTabId;
    else
    return -1;
    }
}

function resolveTab(){

}