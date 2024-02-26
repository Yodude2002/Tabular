

type S2CMessage = S2CAckMessage
    | S2CInsertMessage
    | S2CRemoveMessage;

type S2CAckMessage = {
    message: "ack",
}

type S2CInsertMessage = {
    message: "insert",
    tabId: number,
    globalIndex: number,
}

type S2CRemoveMessage = {
    message: "remove",
    tabId: number,
}

type C2SMessage = C2SConnectMessage;

type C2SConnectMessage = {
    message: "connect",
    windowId: number,
}
