
import * as testUtil from "./test_util.test";
import {testExports} from "./background";
import {S2CMessage, Tab} from "../common/protocol";

function dummyChromeTab(): chrome.tabs.Tab {
    return {
        active: false,
        audible: false,
        autoDiscardable: false,
        discarded: false,
        favIconUrl: "https://github.githubassets.com/favicons/favicon-dark.svg",
        groupId: -1,
        height: 779,
        highlighted: false,
        id: 2137921700,
        incognito: false,
        index: 0,
        mutedInfo: {muted: false},
        pinned: false,
        selected: false,
        status: "complete",
        title: "Yodude2002/Tabular: Tab Management for Chromium Browsers",
        url: "https://github.com/Yodude2002/Tabular",
        width: 1440,
        windowId: testUtil.WINDOW_ID,
    }
}
function chromeTabWith(tab: Partial<chrome.tabs.Tab>): chrome.tabs.Tab {
    const dummy = dummyChromeTab();
    return {
        active: tab.active ?? dummy.active,
        audible: tab.audible ?? dummy.audible,
        autoDiscardable: tab.autoDiscardable ?? dummy.autoDiscardable,
        discarded: tab.discarded ?? dummy.discarded,
        favIconUrl: tab.favIconUrl ?? dummy.favIconUrl,
        groupId: tab.groupId ?? dummy.groupId,
        height: tab.height ?? dummy.height,
        highlighted: tab.highlighted ?? dummy.highlighted,
        id: tab.id ?? dummy.id,
        incognito: tab.incognito ?? dummy.incognito,
        index: tab.index ?? dummy.index,
        lastAccessed: tab.lastAccessed ?? dummy.lastAccessed,
        mutedInfo: tab.mutedInfo ?? dummy.mutedInfo,
        openerTabId: tab.openerTabId ?? dummy.openerTabId,
        pendingUrl: tab.pendingUrl ?? dummy.pendingUrl,
        pinned: tab.pinned ?? dummy.pinned,
        selected: tab.selected ?? dummy.selected,
        sessionId: tab.sessionId ?? dummy.sessionId,
        status: tab.status ?? dummy.status,
        title: tab.title ?? dummy.title,
        url: tab.url ?? dummy.url,
        width: tab.width ?? dummy.width,
        windowId: tab.windowId ?? dummy.windowId,
    }
}

function dummyProtocolTab(): Tab {
    return {
        tabId: 2137921700,
        parentId: -1,
        windowId: testUtil.WINDOW_ID,
        title: "Yodude2002/Tabular: Tab Management for Chromium Browsers",
        url: "https://github.com/Yodude2002/Tabular",
        pinned: false,
        highlighted: false,
        active: false,
        favicon: "https://github.githubassets.com/favicons/favicon-dark.svg",
        audible: false,
        discarded: false,
        discardable: false,
        muted: false,
        groupId: -1,
    }
}
function protocolTabWith(tab: Partial<Tab>): Tab {
    const dummy = dummyProtocolTab();
    return {
        tabId: tab.tabId ?? dummy.tabId,
        parentId: tab.parentId ?? dummy.parentId,
        windowId: tab.windowId ?? dummy.windowId,
        title: tab.title ?? dummy.title,
        url: tab.url ?? dummy.url,
        pinned: tab.pinned ?? dummy.pinned,
        highlighted: tab.highlighted ?? dummy.highlighted,
        active: tab.active ?? dummy.active,
        favicon: tab.favicon ?? dummy.favicon,
        audible: tab.audible ?? dummy.audible,
        discarded: tab.discarded ?? dummy.discarded,
        discardable: tab.discardable ?? dummy.discardable,
        muted: tab.muted ?? dummy.muted,
        groupId: tab.groupId ?? dummy.groupId,
    }
}

test("s2c_insert", async () => {
    const port = testUtil.mockPort();
    jest.spyOn(chrome.tabs.onCreated, "addListener")
        .mockImplementationOnce((fn: (tab: chrome.tabs.Tab) => void) => {
        fn(chromeTabWith({ id: 2137921702, index: 2 }));
    })
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: 2137921700, index: 0}),
        chromeTabWith({ id: 2137921701, index: 1}),
    ]);
    jest.spyOn(port, "postMessage").mockReturnValue(undefined);

    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(port.postMessage).toHaveBeenCalledWith({
        message: "insert",
        tabInfo: protocolTabWith({ tabId: 2137921702 }),
        globalIndex: 2 } satisfies S2CMessage
    );
});

test("s2c_insert_middle", async () => {
    const port = testUtil.mockPort();
    jest.spyOn(chrome.tabs.onCreated, "addListener")
        .mockImplementationOnce((fn: (tab: chrome.tabs.Tab) => void) => {
        fn(chromeTabWith({ id: 2137921702, index: 1 }));
    })
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: 2137921700, index: 0}),
        chromeTabWith({ id: 2137921701, index: 1}),
    ]);
    jest.spyOn(port, "postMessage").mockReturnValue(undefined);

    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(port.postMessage).toHaveBeenCalledWith({
        message: "insert",
        tabInfo: protocolTabWith({ tabId: 2137921702 }),
        globalIndex: 1 } satisfies S2CMessage
    );
    expect(port.postMessage).not.toHaveBeenCalledWith({
        message: "insert",
        tabInfo: protocolTabWith({ tabId: 2137921701 }),
        globalIndex: 2 } satisfies S2CMessage
    );
});

test("s2c_insert_wrong_window", async () => {
    const port = testUtil.mockPort();
    jest.spyOn(chrome.tabs.onCreated, "addListener")
        .mockImplementationOnce((fn: (tab: chrome.tabs.Tab) => void) => {
        fn(chromeTabWith({ id: 2137921702, index: 2, windowId: testUtil.WINDOW_ID + 1 }));
    })
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: 2137921700, index: 0}),
        chromeTabWith({ id: 2137921701, index: 1}),
    ]);
    jest.spyOn(port, "postMessage").mockReturnValue(undefined);

    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(port.postMessage).not.toHaveBeenCalledWith({
        message: "insert",
        tabInfo: protocolTabWith({ tabId: 2137921702 }),
        globalIndex: 2 } satisfies S2CMessage
    );
});
