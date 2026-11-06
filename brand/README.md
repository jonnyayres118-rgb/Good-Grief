# Good Grief — brand consistency implementation

This branch contains a **proposed source of truth** for Good Grief branding. It does not automatically change the production website, Supabase Auth dashboard or published Resend templates.

## Brand reference
- Strapline: **A little planning. A lot of love.**
- Palette: plum `#292333`, cream `#FFF8EC`, lilac `#DCD2F0`, coral `#F07875`, gold `#E8AD58`.
- Visual tone: warm, human, contemporary, distinctive, optimistic and gently irreverent. Avoid turning grief into a joke.
- Initial offer: record and save funeral wishes, then share intentionally with trusted people. Do not advertise life locker, insurance or wills as available until they work.

## Generate email HTML
Run `node brand/generate-emails.mjs` from the repository root. The command produces 15 self-contained HTML templates under `brand/generated-emails/`. They are **drafts**, not a replacement for any already-published templates until QA is complete.

Supabase Auth placeholders use `{{ .ConfirmationURL }}`. Resend variable syntax and IDs require checking against the account's configured variables. Replace logo typography with the approved image using a publicly hosted absolute HTTPS URL once that asset is approved. Test signup, reset, email change and all CTA URLs before sending. Don't publish marketing reminders without consent; prevent duplicate sends and provide unsubscribe. Don't disclose any private funeral plan details in invitation emails.

## Deployment guardrail
Vercel production currently derives from a different source/deployment structure to this repository. **Do not merge expecting an automatic production update.** First reconcile the current production site files, test auth, save/retrieve wishes, recipient permission and email previews on staging, then promote a verified build.
