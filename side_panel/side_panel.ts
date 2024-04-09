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
                    // experimental 
                        appendToContainer(tab);
                        console.log(tab.parentId);
                }
                break;
            }
            case "remove": {
                removeElement(String(message.tabId));
                break;
            }
            case "insert": {
                //Need to implement global index (probably make a function that uses addElement())
                insertintoContainer(message.tabInfo, message.globalIndex);
                
                break;
            }
            case "update":{
                updateTab(message.tabInfo);
                break;

            }
            case "ack": break;
            //default: throw new Error(`unhandled message type: ${message.message}`)
        }
    });
})().catch(console.error);

window.addEventListener("load", (_e) => {
    const mainContainer = document.querySelector(".MainContainer") as HTMLElement;
    const context = document.getElementById("context_menu");
    mainContainer.addEventListener("contextmenu", (mouse) => {
        mouse.preventDefault();
        mouse.stopPropagation();
        context.showPopover();
        const height = Math.min(mouse.pageY, document.documentElement.clientHeight + document.documentElement.scrollTop - context.clientHeight - 8);
        let width = mouse.pageX;
        if (width + context.clientWidth > document.documentElement.clientWidth + document.documentElement.scrollLeft - 8) {
            width -= context.clientWidth;
        }
        context.style.top = `${height}px`;
        context.style.left = `${width}px`;
        context.animate([{
            opacity: 0,
        },{
            opacity: 1,
        }], {
            duration: 200,
            fill: "both",
            easing: "ease-in-out"
        });
    })
})

function addElement(Names: Tab): HTMLElement {
    // Creating newTab with the element of div
    const newTab = document.createElement("div");
    // This is for putting the text within a div element
    const textholder = document.createElement("div");
    

    newTab.id = String(Names.tabId);

    //Makind the newTab to have a class
    newTab.classList.add("Tabs")
    //Classifies textspace class within CSS
    textholder.classList.add("textspace")
    // Making tabcontent to contain text
    const link = document.createElement("img");
    // Setting href attribute for the link

    const button = document.createElement("button");
    
    link.src = Names.favicon;
    console.log(Names.favicon);
    const tabContent = document.createTextNode(Names.title);
    // Make newtab have tabContent

    newTab.append(link);

    //newTab.appendChild(tabContent);
    textholder.appendChild(tabContent);
    newTab.append(textholder);

    // Labeling the button as X
    const exitmessage = document.createTextNode("X");
    newTab.append(button);
    button.append(exitmessage);

    // Get the main container element
    newTab.style.cursor = "pointer";
    // const mainContainer = document.querySelector(".MainContainer"); This selects main container
    // Append newTab to the main container
    newTab.addEventListener('click', (_e) => {
        tabPort.postMessage({
            message: "select",
            tabId: Names.tabId
        } satisfies C2SMessage)
    });
    // button activation stuff, remove exit button
    button.addEventListener('click', (_e) => {
        tabPort.postMessage({
            message: "remove",
            tabId: Names.tabId
        } satisfies C2SMessage)
    });
    return newTab;
}

function removeElement(removeId: string){
    const removedTab = document.getElementById(removeId);
    removedTab.remove();
}
function appendToContainer(Names: Tab){
    const element = addElement(Names);
    var futureparent = document.getElementById(String(Names.parentId));
    var flexContainer = document.querySelector(".MainContainer");
    // LOL
    //Handles children tabs, aims to increment marginLeft by marginsize
    const marginsize = 50;
    if (Names.parentId != -1){
        var presize = (futureparent.style.marginLeft);
        if(presize == ""){
            element.style.marginLeft = marginsize + "px";
        }else{
            // takes the string of marginleft and converts to a number
            presize = presize.replace("px", "");
            var newsize = Number(presize) + marginsize;
            element.style.marginLeft = newsize + "px";
        }
    }
    //Handles children tab above
    //Appends children to mainContainer, and under parent
    if(flexContainer != null)
        flexContainer.appendChild(element);
}
// Past experimental function
/*function appendToParent(currentTabInfo: Tab){
    const element = addElement(currentTabInfo);
    var flexContainer = document.getElementById(String(currentTabInfo.parentId));
    if(flexContainer != null)
        flexContainer.appendChild(element);
}*/
function insertintoContainer(currenttabInfo: Tab, funnyindex: number){
    var replacementElement = addElement(currenttabInfo);
    var futureparent = document.getElementById(String(currenttabInfo.parentId));
    var stuff = document.querySelector(".MainContainer");
    //Handles children tabs, aims to increment marginLeft by marginsize
    const marginsize = 50;
    if (currenttabInfo.parentId != -1){
        var presize = (futureparent.style.marginLeft);
        if(presize == ""){
            replacementElement.style.marginLeft = marginsize + "px";
        }else{
            // takes the string of marginleft and converts to a number
            presize = presize.replace("px", "");
            var newsize = Number(presize) + marginsize;
            replacementElement.style.marginLeft = newsize + "px";
        }
    }
    //  stuff
    var beforereplacementElement = stuff.children[funnyindex];
    stuff.insertBefore(replacementElement , beforereplacementElement);
}
function updateTab(currenttabInfo: Tab){
    var randomstuff = document.getElementById(String(currenttabInfo.tabId));
    var randomstuff2 = randomstuff.querySelector(".textspace");
    var randomstuff3 = randomstuff.querySelector("img");
    //Refactoring is needed in the future
    randomstuff2.textContent = currenttabInfo.title;
    randomstuff3.src = currenttabInfo.favicon;
}