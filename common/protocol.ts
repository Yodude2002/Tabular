
export type Tab = {
    tabId: number,
    parentId: number,
    windowId: number,
    title: string,
    url: string,
    pinned: boolean,
    highlighted: boolean,
    active: boolean,
    favicon: string,
    audible: boolean,
    discarded: boolean,
    discardable: boolean,
    muted: boolean,
    groupId: number,
}

export type S2CMessage = S2CAckMessage
    | S2CStateMessage
    | S2CInsertMessage
    | S2CRemoveMessage;

type S2CAckMessage = {
    message: "ack",
}

type S2CStateMessage = {
    message: "state",
    tabs: Tab[]
}

type S2CInsertMessage = {
    message: "insert",
    globalIndex: number,
    tabInfo: Tab,
}

type S2CRemoveMessage = {
    message: "remove",
    tabId: number,
}

export type C2SMessage = C2SConnectMessage | C2STabSelectMessage | C2SRemoveMessage;

type C2SConnectMessage = {
    message: "connect",
    windowId: number,
}

type C2STabSelectMessage = {
    message: "select",
    tabId: number,
}
type C2SRemoveMessage = {
    message: "remove",
    tabId: number,
}