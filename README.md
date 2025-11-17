# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Chat logging to Google Sheets (no n8n)

You can log chat history to a Google Sheet (Sheet3) without running n8n or your own backend:

1) Create a Google Apps Script bound to your spreadsheet and add this minimal code:

```js
function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const sheetName = data.sheet || 'Sheet3';
  const sh = SpreadsheetApp.getActive().getSheetByName(sheetName) || SpreadsheetApp.getActive().insertSheet(sheetName);
  sh.appendRow([new Date(), data.user || '', data.question || '', data.answer || '', data.timestamp || '']);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

2) Deploy as Web App with access “Anyone with the link”, and copy the deployment URL.

3) Create a `.env` file based on `.env.example` and set:

```
VITE_LOG_SHEET_URL=<your apps script web app url>
```

4) Restart dev server. The app will POST chat logs to that URL after each answer.
