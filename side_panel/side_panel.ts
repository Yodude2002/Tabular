import {C2SMessage, S2CMessage, Tab} from "../common/protocol";


declare global {
    var WINDOW_ID: number;
    var tabPort: chrome.runtime.Port;
}

(async function() {
    const wid = (await chrome.windows.getCurrent()).id
    if (typeof wid === "undefined") return;
    window.WINDOW_ID = wid;

    window.tabPort = chrome.runtime.connect({ name: `${wid}` });
    window.tabPort.onMessage.addListener((message: S2CMessage) => {

        switch (message.message) {
            case "state": {
                for (const tab of message.tabs) {
                    addElement(tab);
                }
                break;
            }
            case "ack": break;
            default: throw new Error(`unhandled message type: ${message.message}`)
        }
    });
})().catch(console.error);

function addElement(Names: Tab) {
    // Creating newTab with the element of div
    const newTab = document.createElement("div");
    //Makind the newTab to have a class
    newTab.classList.add("Tabs")
    // Making tabcontent to contain text
    const link = document.createElement("img");
    // Setting href attribute for the link
    link.src = Names.favicon;
    console.log(Names.favicon);
    const tabContent = document.createTextNode(Names.title);
    // Make newtab have tabContent
    newTab.append(link);
    newTab.appendChild(tabContent);
    // Get the main container element
    newTab.style.cursor = "pointer";
    const mainContainer = document.querySelector(".MainContainer");
    // Append newTab to the main container
    if(mainContainer != null)
        mainContainer.appendChild(newTab);
    newTab.addEventListener('click', (_e) => {
        tabPort.postMessage({
            message: "select",
            tabId: Names.tabId
        } satisfies C2SMessage)
    });
}