# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2d25c37c-a4be-4c9d-8f4e-09aa0f61a964

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy the `.env` template or set the `GEMINI_API_KEY` and `JWT_SECRET` in `.env` to your API keys.
3. Run the app:
   `npm run dev`

   > **Note for Windows Users:** If your folder path contains an ampersand (`&`) (like `pdf-imposer-&-note-optimizer`), `npm run dev` might fail because of a known `cmd.exe` bug. You can either:
   > - Rename the folder to remove the `&` (e.g., `pdf-imposer-and-note-optimizer`), or
   > - Run the dev server directly using Node: `node "node_modules\tsx\dist\cli.mjs" server.ts`
