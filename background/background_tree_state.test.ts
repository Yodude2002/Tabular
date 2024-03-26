
import * as testUtil from "./test_util.test";
import {testExports} from "./background";
import {S2CMessage, Tab} from "../common/protocol";

const TAB_ID_BASE = 2137921700;

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
        id: TAB_ID_BASE,
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
        tabId: TAB_ID_BASE,
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
        active: tab.active ?? dummy.active,
        audible: tab.audible ?? dummy.audible,
        discardable: tab.discardable ?? dummy.discardable,
        discarded: tab.discarded ?? dummy.discarded,
        favicon: tab.favicon ?? dummy.favicon,
        groupId: tab.groupId ?? dummy.groupId,
        highlighted: tab.highlighted ?? dummy.highlighted,
        muted: tab.muted ?? dummy.muted,
        parentId: tab.parentId ?? dummy.parentId,
        pinned: tab.pinned ?? dummy.pinned,
        tabId: tab.tabId ?? dummy.tabId,
        title: tab.title ?? dummy.title,
        url: tab.url ?? dummy.url,
        windowId: tab.windowId ?? dummy.windowId,
    }
}

test("state_tree_none", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: -1 }),
    ] } satisfies S2CMessage);
});

test("state_tree_one", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2, openerTabId: TAB_ID_BASE + 1 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: TAB_ID_BASE + 1 }),
    ] } satisfies S2CMessage);
});

test("state_tree_one_middle", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1, openerTabId: TAB_ID_BASE }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: TAB_ID_BASE }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: -1 }),
    ] } satisfies S2CMessage);
});

test("state_tree_many", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1, openerTabId: TAB_ID_BASE }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2, openerTabId: TAB_ID_BASE }),
        chromeTabWith({ id: TAB_ID_BASE + 3, index: 3, openerTabId: TAB_ID_BASE }),
        chromeTabWith({ id: TAB_ID_BASE + 4, index: 4 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: TAB_ID_BASE }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: TAB_ID_BASE }),
        protocolTabWith({ tabId: TAB_ID_BASE + 3, parentId: TAB_ID_BASE }),
        protocolTabWith({ tabId: TAB_ID_BASE + 4, parentId: -1 }),
    ] } satisfies S2CMessage);
});

test("state_tree_before", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0, openerTabId: TAB_ID_BASE + 2 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2 }),
        chromeTabWith({ id: TAB_ID_BASE + 3, index: 3, openerTabId: TAB_ID_BASE + 2 }),
        chromeTabWith({ id: TAB_ID_BASE + 4, index: 4 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 3, parentId: TAB_ID_BASE + 2 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 4, parentId: -1 }),
    ] } satisfies S2CMessage);
});

test("state_tree_after", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2 }),
        chromeTabWith({ id: TAB_ID_BASE + 3, index: 3 }),
        chromeTabWith({ id: TAB_ID_BASE + 4, index: 4, openerTabId: TAB_ID_BASE + 1 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 3, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 4, parentId: -1 }),
    ] } satisfies S2CMessage);
});

test("state_tree_disjoint", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2, openerTabId: TAB_ID_BASE + 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 3, index: 3 }),
        chromeTabWith({ id: TAB_ID_BASE + 4, index: 4, openerTabId: TAB_ID_BASE + 1 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: TAB_ID_BASE + 1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 3, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 4, parentId: -1 }),
    ] } satisfies S2CMessage);
});

test("state_tree_grandchildren", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([
        chromeTabWith({ id: TAB_ID_BASE,     index: 0 }),
        chromeTabWith({ id: TAB_ID_BASE + 1, index: 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 2, index: 2, openerTabId: TAB_ID_BASE + 1 }),
        chromeTabWith({ id: TAB_ID_BASE + 3, index: 3, openerTabId: TAB_ID_BASE + 2 }),
        chromeTabWith({ id: TAB_ID_BASE + 4, index: 4, openerTabId: TAB_ID_BASE + 1 }),
    ]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.query).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: testUtil.WINDOW_ID } satisfies chrome.tabs.QueryInfo)

    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "state", tabs: [
        protocolTabWith({ tabId: TAB_ID_BASE,     parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 1, parentId: -1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 2, parentId: TAB_ID_BASE + 1 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 3, parentId: TAB_ID_BASE + 2 }),
        protocolTabWith({ tabId: TAB_ID_BASE + 4, parentId: TAB_ID_BASE + 1 }),
    ] } satisfies S2CMessage);
});



