# Tabular
Tab management for Chromium Browsers

Chrome places its tabs on the tab strip; With large numbers of tabs, this makes organization difficult or impossible.
Tabular presents a menu in the Side Panel that mirrors Chrome's tab strip, providing access to the same features with a different layout.
Tabular aims to have feature-parity with the Tab Strip, with support for tab groups, a context menu, and drag & drop.

Additionally, Tabular organizes its tabs in a hierarchical view, placing its tabs in a tree (like [Tree Style Tab](https://addons.mozilla.org/en-US/firefox/addon/tree-style-tab/)).

This project is not complete; planned features may be incomplete, broken, or missing.

## Prerequisites

This project builds using TypeScript and tests with ts-jest. After installing [Node.js](https://nodejs.org), clone the repository:
```sh
git clone https://github.com/Yodude2002/Tabular.git
```
Navigate to the working directory, and install dependencies:
```sh
npm install
```
To install TypeScript globally, run
```sh
npm install -g typescript
```

## Using Tabular

To transpile Typescript files to JS, run `tsc` from the working directory:
```sh
tsc
```
Once the project is built, you'll need to load the extension in Chrome:
1. Navigate to the Chrome Extensions Settings menu (`chrome://extensions`).
2. Enable **Developer mode** with the toggle switch at the top-right of the screen.
3. At the top-left of the page, click the button labeled `Load Unpacked`.
4. Navigate to the working directory of the project, and load the extension.

For more information, refer to [Loading an Unpacked Extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

To open the Side Panel, Click the Side Panel icon in the Chrome toolbar (located to the right of the Extensions menu).
Using the drop-down menu at the top of the Side Panel, selct 'Tabular'

### Reloading Tabular

Whenever part of the extension has been modified, the extension will need to be reloaded.
If any TypeScript files have been modified, re-run `tsc` to sync changes.
Then, close and reopen the Side Panel to reload the UI. 
If the background script has been modified, click the reload button in the Chrome Extensions settings menu (`chrome://extensions`).

## Testing

Before running tests, ensure that the working tree does not contain any JS files, as these can cause the wrong files to be used during tests.
To remove generated JS files, run the following:
```sh
tsc --build --clean
```
Then, you can run the test suite:
```sh
npm test
```
