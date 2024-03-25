
global.chrome = {
    tabs: {
        query: async(_queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
            throw new Error("override this with jest.spyOn()");
        },
        onCreated: emptyEvent(),
        onRemoved: emptyEvent(),
    },
    runtime: {
        onConnect: emptyEvent(),
        onInstalled: emptyEvent()
    }
} as typeof chrome

export const WINDOW_ID = 2137921002;

export function emptyEvent<T extends Function>(): chrome.events.Event<T> {
    return {
        hasListener<T>(_callback: T): boolean { return false; },
        removeListener<T>(_callback: T): void {},
        addListener(_callback: T, _filter?: chrome.webRequest.RequestFilter): void {},
        addRules(_rules: chrome.events.Rule[], _callback?: (rules: chrome.events.Rule[]) => void): void {},
        getRules(_ruleIdentifiers: string[] | ((rules: chrome.events.Rule[]) => void), _callback?: (rules: chrome.events.Rule[]) => void): void {},
        hasListeners(): boolean { return false; },
        removeRules(_ruleIdentifiers?: (() => void) | string[], _callback?: () => void): void {}
    }
}
export function mockEvent<T extends Function>(): chrome.events.Event<T> {
    return {
        hasListener<T>(_callback: T): boolean {
            throw new Error("unimplemented");
        },
        removeListener<T>(_callback: T): void {
            throw new Error("unimplemented");
        },
        addListener(_callback: T, _filter?: chrome.webRequest.RequestFilter): void {
            throw new Error("unimplemented");
        },
        addRules(_rules: chrome.events.Rule[], _callback?: (rules: chrome.events.Rule[]) => void): void {
            throw new Error("unimplemented");
        },
        getRules(_ruleIdentifiers: string[] | ((rules: chrome.events.Rule[]) => void), _callback?: (rules: chrome.events.Rule[]) => void): void {
            throw new Error("unimplemented");
        },
        hasListeners(): boolean {
            throw new Error("unimplemented");
        },
        removeRules(_ruleIdentifiers?: (() => void) | string[], _callback?: () => void): void {
            throw new Error("unimplemented");
        }
    }
}
export function mockPort(): chrome.runtime.Port {
    return {
        postMessage: (_message: any): void => { throw new Error("unimplemented") },
        disconnect: (): void => {},
        onDisconnect: mockEvent(),
        name: `${WINDOW_ID}`,
        onMessage: emptyEvent(),
    }
}

test.skip("skip", () => {});