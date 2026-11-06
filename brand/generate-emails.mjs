import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const brand = JSON.parse(fs.readFileSync(path.join(here, 'brand.json'), 'utf8'));
const out = path.join(here, 'generated-emails');
fs.mkdirSync(out, { recursive: true });
const rows = [
 ['01_supabase_magic_link','Your Good Grief sign-in link','Sign in securely to your Good Grief account.','{{ .ConfirmationURL }}','Sign in to Good Grief'],
 ['02_supabase_confirm_signup','Welcome to Good Grief','Confirm your email address to get started.','{{ .ConfirmationURL }}','Confirm my email'],
 ['03_supabase_recovery','Reset your Good Grief password','Someone requested a password reset. Ignore this email if it wasn’t you.','{{ .ConfirmationURL }}','Reset password'],
 ['04_supabase_invite','You’re invited to Good Grief','You’ve been invited to join Good Grief.','{{ .ConfirmationURL }}','Accept invitation'],
 ['05_supabase_email_change','Confirm your new email','Confirm the email address change you requested.','{{ .ConfirmationURL }}','Confirm email change'],
 ['06_supabase_reauthentication','Confirm it’s you','For your security, confirm your identity to continue.','{{ .ConfirmationURL }}','Continue securely'],
 ['07_welcome','Welcome to Good Grief','A little planning. A lot of love. Your wishes can start with one small thing.','{{app_url}}','Start my wishes'],
 ['08_getting_started','Your wishes, at your pace','A song, a poem or a small detail is a perfectly good place to start.','{{app_url}}','Continue my wishes'],
 ['09_plan_progress','A gentle nudge from Good Grief','Your wishes will be here whenever you’re ready. No rush.','{{app_url}}','Pick up where I left off'],
 ['10_ready_to_share','Your wishes are ready when you are','You decide whether, when and with whom to share your plan.','{{app_url}}','Review sharing options'],
 ['11_paid_unlock','Your Good Grief purchase','Thank you. Your sharing or export feature is ready to use.','{{app_url}}','View my account'],
 ['12_recipient_invitation','Someone has shared wishes with you','Someone you know has chosen to share their Good Grief wishes with you.','{{secure_invitation_url}}','View invitation'],
 ['13_subscription_renewal','Your Good Grief subscription','Here is an update about your subscription and upcoming renewal.','{{billing_url}}','Manage subscription'],
 ['14_annual_review','Your annual Good Grief check-in','Life changes. Your wishes can too. Take a moment to check what still feels right.','{{app_url}}','Review my wishes'],
 ['15_newsletter','A little note from Good Grief','An occasional update from Good Grief, only if you’ve opted in.','{{app_url}}','Visit Good Grief']
];
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for (const [file, subject, message, href, button] of rows) {
 const {plum,cream,lilac,coral,secondary}=brand.colors;
 const unsub = file==='15_newsletter' ? '<p style="font-size:12px"><a href="{{unsubscribe_url}}">Unsubscribe</a></p>' : '';
 const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head><body style="margin:0;padding:28px 14px;background:${cream};color:${plum};font-family:Arial,Helvetica,sans-serif"><div style="max-width:560px;margin:auto;border:1px solid ${lilac};border-radius:16px;overflow:hidden;background:#fff"><div style="background:${cream};padding:28px 34px"><div style="font-family:Georgia,serif;font-size:30px;line-height:0.9;font-weight:bold">Good<br>Grief.</div><p style="font-size:12px;color:${secondary}">${esc(brand.tagline)}</p></div><div style="padding:32px 34px"><h1 style="font-family:Georgia,serif;font-size:27px;line-height:1.2">${esc(subject)}</h1><p style="font-size:16px;line-height:1.65">${esc(message)}</p><p style="margin:30px 0"><a href="${href}" style="background:${coral};color:${plum};font-weight:bold;padding:14px 22px;text-decoration:none;border-radius:8px;display:inline-block">${esc(button)}</a></p><p style="font-size:13px;color:${secondary}">If you weren't expecting this email, you can ignore it.</p></div><div style="padding:22px 34px;background:${cream};font-size:12px;color:${secondary}">Good Grief · A little planning. A lot of love.${unsub}</div></div></body></html>`;
 fs.writeFileSync(path.join(out,file+'.html'),html);
}
console.log('Generated '+rows.length+' Good Grief email HTML files in '+out);
