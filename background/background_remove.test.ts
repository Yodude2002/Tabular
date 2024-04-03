
import * as testUtil from "./test_util.test";

declare global {
    var onRemoved: (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => void;
}

jest.spyOn(chrome.tabs.onRemoved, "addListener").mockImplementationOnce((fn: (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => void) => {
    globalThis.onRemoved = fn;
})

import {testExports} from "./background";
import {C2SMessage, C2SRemoveMessage, S2CMessage} from "../common/protocol";

function dummyC2SMessage(): C2SRemoveMessage {
    return {
        message: "remove", tabId: 2137921700,
    }
}

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

test("c2s_remove_dispatch", async () => {
    const port = testUtil.mockPort();
    jest.spyOn(port.onMessage, "addListener").mockImplementationOnce((fn: (message: C2SMessage, port: chrome.runtime.Port) => void) => {
        fn(dummyC2SMessage(), port);
    })
    jest.spyOn(port, "postMessage").mockReturnValue(undefined);

    jest.spyOn(chrome.tabs, "remove").mockImplementation(() => Promise.resolve());
    jest.spyOn(chrome.tabs, "query").mockResolvedValue([dummyChromeTab()]);

    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    expect(chrome.tabs.remove).toHaveBeenCalledWith(dummyC2SMessage().tabId);
});

test("c2s_remove", async () => {
    jest.spyOn(chrome.tabs, "remove").mockImplementation(() => Promise.resolve());

    testExports.handleTabRemoveMessage(dummyC2SMessage());

    await new Promise(process.nextTick);
    expect(chrome.tabs.remove).toHaveBeenCalledWith(dummyC2SMessage().tabId);
});

test("s2c_remove", async () => {
    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockReturnValue(undefined);

    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    onRemoved(dummyC2SMessage().tabId, { windowId: testUtil.WINDOW_ID, isWindowClosing: false });

    await new Promise(process.nextTick);
    expect(port.postMessage).toHaveBeenCalledWith({ message: "remove", tabId: dummyC2SMessage().tabId } satisfies S2CMessage)
});

test("s2c_remove_wrong_window", async () => {
    const port = testUtil.mockPort();
    jest.spyOn(port, "postMessage").mockReturnValue(undefined);

    testExports.handleNewConnection(port);

    await new Promise(process.nextTick);
    onRemoved(dummyC2SMessage().tabId, { windowId: testUtil.WINDOW_ID + 1, isWindowClosing: false });

    await new Promise(process.nextTick);
    expect(port.postMessage).not.toHaveBeenCalledWith({ message: "remove", tabId: dummyC2SMessage().tabId } satisfies S2CMessage);
});