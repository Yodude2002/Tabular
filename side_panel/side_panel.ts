
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

// Get the button element
const button = document.getElementById("clickMe");

// Add event listener to the button
button.addEventListener("click", addElement);

function addElement() {
    // Creating newTab with the element of div
    const newTab = document.createElement("div");
    //Makind the newTab to have a class
    newTab.classList.add("Tabs")
    // Making tabcontent to contain text
    const tabContent = document.createTextNode("test");
    // Make newtab have tabContent
    newTab.appendChild(tabContent);
    // Get the main container element
    const mainContainer = document.querySelector(".MainContainer");
    // Append newTab to the main container
    mainContainer.appendChild(newTab);
}