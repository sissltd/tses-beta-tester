# TSES Beta Tester Signup

Public signup form for the TSES Beta Tester program. Submissions flow into the existing Google Form / Google Sheet.

## Deploy

Built with Vite + React + Tailwind. Deploys cleanly to Vercel or Netlify with no config — they'll auto-detect the framework.

## Local development

```bash
npm install
npm run dev
```

## Update Google Form entry IDs

If the Google Form is edited (fields added/removed/renamed), the entry IDs may shift. To update:

1. Open the Google Form in edit mode
2. Three-dot menu → "Get pre-filled link"
3. Fill every field with placeholder text
4. Click "Get Link" → "Copy Link"
5. Paste the URL — it contains `entry.XXXXXXXXX=value` pairs
6. Update the matching IDs in `src/TSESBetaSignup.jsx` (top of file, `ENTRY_IDS` object)
