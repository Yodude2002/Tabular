
interface Window {
    WINDOW_ID: number,
    tabPort: chrome.runtime.Port,
}

(async function() {
    const wid = (await chrome.windows.getCurrent()).id
    if (typeof wid === "undefined") return;
    window.WINDOW_ID = wid;

    window.tabPort = chrome.runtime.connect({ name: `${wid}` });
    window.tabPort.onMessage.addListener((message: S2CMessage) => {
        console.log(message)
    });
})().catch(console.error);