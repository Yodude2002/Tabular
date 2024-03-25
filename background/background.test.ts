import {S2CMessage, Tab} from "../common/protocol";
import * as testUtil from "./test_util.test";
import {testExports} from "./background";


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
        windowId: 2137921002,
    }
}
function dummyProtocolTab(): Tab {
    return {
        tabId: 2137921700,
        parentId: -1,
        windowId: 2137921002,
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

// Test 1: test receiving tabs
test("query_tabs", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([dummyChromeTab()]);
    expect(await chrome.tabs.query({})).toStrictEqual([dummyChromeTab()]);
})

// Test 2: test background receiving a message
test("query_connect", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([dummyChromeTab()]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(port.postMessage).toHaveBeenCalledTimes(2);
    expect(port.postMessage).toHaveBeenNthCalledWith(1, { message: "ack" } satisfies S2CMessage);
    expect(port.postMessage).toHaveBeenNthCalledWith(2, { message: "state", tabs: [dummyProtocolTab()] } satisfies S2CMessage);
})

// Test 3: test background receiving a message with multiple tabs
test("query_connect_many", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([dummyChromeTab(), dummyChromeTab(), dummyChromeTab()]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(port.postMessage).toHaveBeenCalledTimes(2);
    expect(port.postMessage).toHaveBeenNthCalledWith(1, { message: "ack" } satisfies S2CMessage);
    expect(port.postMessage).toHaveBeenNthCalledWith(2, { message: "state", tabs: [
        dummyProtocolTab(),
        dummyProtocolTab(),
        dummyProtocolTab()
    ] } satisfies S2CMessage);
})

// Test 4: test background receiving a message with no tabs
test("query_connect_empty", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([]);

    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(port.postMessage).toHaveBeenCalledTimes(2);
    expect(port.postMessage).toHaveBeenNthCalledWith(1, { message: "ack" } satisfies S2CMessage);
    expect(port.postMessage).toHaveBeenNthCalledWith(2, { message: "state", tabs: [] } satisfies S2CMessage);
})

// Test 5: test background receiving multiple connections
test("query_connect_concurrent", async () => {
    jest.restoreAllMocks();
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([dummyChromeTab()]);

    const port1 = testUtil.mockPort();
    jest.spyOn(port1, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port1);

    const port2 = testUtil.mockPort();
    jest.spyOn(port2, "postMessage").mockImplementation((_message: any) => {});
    testExports.handleNewConnection(port2);

    await new Promise(process.nextTick);
    expect(port1.postMessage).toHaveBeenCalledTimes(2);
    expect(port1.postMessage).toHaveBeenNthCalledWith(1, { message: "ack" } satisfies S2CMessage);
    expect(port1.postMessage).toHaveBeenNthCalledWith(2, { message: "state", tabs: [dummyProtocolTab()] } satisfies S2CMessage);

    expect(port2.postMessage).toHaveBeenCalledTimes(2);
    expect(port2.postMessage).toHaveBeenNthCalledWith(1, { message: "ack" } satisfies S2CMessage);
    expect(port2.postMessage).toHaveBeenNthCalledWith(2, { message: "state", tabs: [dummyProtocolTab()] } satisfies S2CMessage);
})