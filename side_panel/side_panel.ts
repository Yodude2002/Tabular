
interface Window {
    WINDOW_ID: number,
    tabPort: chrome.runtime.Port,
}

(async function() {
    const wid = (await chrome.windows.getCurrent()).id
    if (typeof wid === "undefined") return;
    window.WINDOW_ID = wid;

    window.tabPort = chrome.runtime.connect({ name: `${wid}` });
    window.tabPort.onMessage.addListener((message: S2CMessage | string []) => {
        if(Array.isArray(message)){
            let tabLength = message.length
            for(let i = 0; i < tabLength; i++){
                addElement(message[i]);
            }
        }
    });
})().catch(console.error);

function addElement(Names: string) {
    // Creating newTab with the element of div
    const newTab = document.createElement("div");
    //Makind the newTab to have a class
    newTab.classList.add("Tabs")
    // Making tabcontent to contain text
    const tabContent = document.createTextNode(Names);
    // Make newtab have tabContent
    newTab.appendChild(tabContent);
    // Get the main container element
    const mainContainer = document.querySelector(".MainContainer");
    // Append newTab to the main container
    mainContainer.appendChild(newTab);
}