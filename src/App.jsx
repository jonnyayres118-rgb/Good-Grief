import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowSquareOut, CaretRight, Check, CheckCircle, Copy, CreditCard, Cube, EnvelopeSimple, Eye, FileText, Heart, House, Link, List, LockKey, MusicNotes, PencilSimple, SealCheck, ShieldCheck, Sparkle, Tag, Trash, UserPlus, UsersThree, WarningCircle, X } from "@phosphor-icons/react";
import { acceptInvite, completeEmailConfirmation, createAccount, createInvite, currentUser, deleteAccount, getAccessSummary, getEntitlement, getPaymentConfiguration, isLiveBackend, loadCloudPlan, loadPlan, loadSharedPlan, openBillingPortal, persistPlan, resendConfirmation, revokeAccess, signIn, startCheckout } from "./lib/supabase.js";
import { productAreas, planSteps } from "./content/product.js";
import { calculateProgress, containsSensitiveSecret, getBlockStatus, markBlockSorted, normalizePlan, updateBlockAnswer } from "./domain/plan.js";

const answerFor = (answers, step) => answers?.[step.areaKey]?.[step.field] || "";

const faqs = [
  ["Is this legally binding?", "No. Good Grief records and shares your wishes clearly; it does not replace a will or legal advice."],
  ["Can I change my plan?", "Yes—whenever you like. Your plan is designed to grow and change with you."],
  ["Who can see it?", "Only you and people you choose to share a private link with. You can revoke that link at any time."],
  ["What information do you store?", "Only the account details and funeral-plan answers needed to provide the service. We never sell your plan data."],
];

function Brand({ dark = true }) {
  return <button className={`brand ${dark ? "brand--dark" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Good Grief home"><span>Good</span><span>Grief</span></button>;
}

function Header({ onStart, onSignIn }) {
  const [open, setOpen] = useState(false);
  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };
  return <header className="site-header"><Brand /><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation"><List size={25} /></button><nav className={open ? "nav-open" : ""} aria-label="Primary navigation"><button onClick={() => go("how")}>How it works</button><button onClick={() => go("pricing")}>Pricing</button><button onClick={onSignIn}>Sign in</button><button className="button button--sun header-cta" onClick={onStart}>Start my plan <ArrowRight weight="bold" /></button></nav></header>;
}

function Hero({ onStart, onSignIn }) {
  return <section className="hero hero--new" id="top"><Header onStart={onStart} onSignIn={onSignIn} /><div className="hero-copy"><p className="eyebrow eyebrow--pink">Good Grief</p><h1><span>Life is complicated</span><span className="yellow">enough.</span><span>Leaving things behind</span><span className="pink">shouldn’t be.</span></h1><p className="hero-intro">Keep your wishes, important information and plans together, so the people you love aren’t left guessing.</p><div className="hero-actions"><button className="button button--sun button--large" onClick={onStart}>Start my plan <ArrowRight weight="bold" /></button><button className="text-link text-link--light" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>See how it works <ArrowDown /></button></div></div><aside className="hero-note"><span>Some things are worth writing down.</span><b>The important things.<br />The practical things.<br />And the things only you would think to mention.</b><small>Yes, that includes who gets the dog.</small></aside></section>;
}

function Manifesto() {
  return <section className="manifesto manifesto--new"><p className="eyebrow">All the things people may one day need</p><h2>One place.<br /><span>Less guesswork.</span></h2><div className="manifesto-copy"><p>Your family knows you love them. Knowing where the insurance documents are would also be helpful.</p><p>Start with what you know. Skip what you don’t. You can change your mind whenever you like.</p></div></section>;
}

function ProductAreas() {
  return <section className="areas" id="areas"><header><p className="eyebrow eyebrow--pink">Your Good Grief plan</p><h2>Useful now.<br />Even more useful later.</h2></header><div className="areas-grid">{productAreas.map((area, index) => <article className={`area-card area-card--${area.colour}`} key={area.key}><span>0{index + 1}</span><p>{area.kicker}</p><h3>{area.title}</h3><div>{area.description}</div><ul>{area.fields.slice(0, 3).map(([, title]) => <li key={title}>{title}</li>)}</ul></article>)}</div></section>;
}

function HowItWorks({ onStart }) {
  const cards = [["01", "Make your plan", "A few useful prompts, tackled in any order and at your own pace."], ["02", "Keep it somewhere safe", "Come back whenever something changes. Your plan stays current."], ["03", "Share what matters", "You choose the people, the categories and exactly what they can see."]];
  return <section className="how" id="how"><div className="section-heading"><p className="eyebrow eyebrow--pink">How it works</p><h2>Sort a little.<br />Feel a lot better.</h2></div><div className="steps-grid">{cards.map(([n, title, copy]) => <article className="step-card" key={n}><span className="step-number">{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><button className="button button--pink button--large" onClick={onStart}>Make a start <ArrowRight weight="bold" /></button></section>;
}

function PreviewSection() {
  return <section className="preview-section"><div className="preview-copy"><p className="eyebrow">Your wishes, all together</p><h2>The practical stuff.<br /><span>With personality.</span></h2><p>A calm, guided place for everything people will need to know—without turning life into a form-filling exercise.</p><ul>{["Style, setting and atmosphere", "Music, readings and people", "Practical notes and hard no's", "A message for the people you love"].map(x => <li key={x}><Check weight="bold" />{x}</li>)}</ul></div><div className="planner-preview"><div className="preview-top"><Brand dark={false} /><span>6 blocks in place</span></div><div className="preview-progress"><i /></div><span className="preview-kicker">The soundtrack</span><h3>What should everyone hear?</h3><div className="answer-card"><MusicNotes size={24} weight="fill" /><span>Heroes — David Bowie</span><PencilSimple /></div><div className="answer-card"><MusicNotes size={24} weight="fill" /><span>Into My Arms — Nick Cave</span><PencilSimple /></div><button>+ Add another</button></div></section>;
}

function Pricing({ onPick }) {
  return <section className="pricing" id="pricing"><div className="section-heading section-heading--center"><p className="eyebrow eyebrow--pink">Simple pricing</p><h2>A plan people<br />can actually use.</h2><p>Build it, keep it current and make sure the right people can find it when it matters.</p></div><div className="price-grid"><article className="price-card"><p className="price-label">Annual</p><div className="price"><b>£29</b><span>/ year</span></div><p>A small yearly payment to keep your plan safe, current and ready.</p><ul><li><Check /> Twenty guided building blocks</li><li><Check /> One living plan, always current</li><li><Check /> Account-protected sharing</li><li><Check /> Access register and revocation</li><li><Check /> Unlimited updates across devices</li></ul><button className="button button--ink" onClick={() => onPick("annual")}>Choose annual <ArrowRight /></button></article><article className="price-card price-card--featured"><span className="price-burst">Best<br />value</span><p className="price-label">Founding lifetime</p><div className="price"><b>£75</b><span>once</span></div><p>Pay once and keep the complete Good Grief experience for good.</p><ul><li><Check /> Everything in Annual</li><li><Check /> Lifetime access to your living plan</li><li><Check /> Lifetime trusted sharing</li><li><Check /> Founding-member price</li><li><Check /> No recurring payment</li></ul><button className="button button--sun" onClick={() => onPick("lifetime")}>Choose lifetime <ArrowRight /></button></article></div><p className="pricing-note"><LockKey weight="fill" /> Secure checkout and billing powered by Stripe. Cancel Annual anytime.</p></section>;
}

function Trust() {
  return <section className="trust"><div><ShieldCheck size={42} weight="fill" /><p className="eyebrow">Private means private</p><h2>Nobody needs to know everything.</h2><p>Your information is not content. We don’t sell it or advertise against it. You choose who sees what, and you can change that access.</p></div><div className="trust-points"><p><LockKey />Account-protected access</p><p><Link />Revocable invitations</p><p><Eye />Category-by-category control</p></div></section>;
}

function FAQ() {
  const [active, setActive] = useState(0);
  return <section className="faq"><p className="eyebrow eyebrow--pink">GOOD QUESTIONS</p><h2>Before you ask…</h2><div>{faqs.map(([q, a], i) => <article key={q}><button onClick={() => setActive(active === i ? -1 : i)} aria-expanded={active === i}><span>{q}</span><b>{active === i ? "−" : "+"}</b></button>{active === i && <p>{a}</p>}</article>)}</div></section>;
}

function Footer({ onStart }) {
  return <footer><div><Brand /><h2>Make things easier<br /><span>for the people you love.</span></h2><button className="button button--sun button--large" onClick={onStart}>Start my plan <ArrowRight /></button></div><div className="footer-bottom"><span>© 2026 Good Grief</span><span>Privacy · Terms · Help</span><span>Made for living</span></div></footer>;
}

function SignupModal({ plan, mode, onClose, onComplete, onDraft = onClose }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resent, setResent] = useState(false);
  const signin = mode === "signin";
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = signin ? await signIn(form) : await createAccount({ ...form, plan });
      if (result.requiresConfirmation) {
        setConfirmationSent(true);
        return;
      }
      onComplete(plan || "annual");
    } catch (err) { setError(err.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  const resend = async () => { setBusy(true); setError(""); try { await resendConfirmation(form.email); setResent(true); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  if (confirmationSent) return <div className="modal-backdrop"><div className="modal confirmation-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X /></button><div className="confirmation-envelope"><EnvelopeSimple size={38} weight="fill" /></div><p className="eyebrow eyebrow--pink">ONE QUICK CHECK</p><h2>Confirm it’s really you.</h2><p>We’ve sent a confirmation link to <b>{form.email}</b>. It will return you to Good Grief—not a blank page.</p><div className="confirmation-steps"><span>1</span><p>Open the newest Good Grief email.</p><span>2</span><p>Click <b>Confirm my email</b> once.</p><span>3</span><p>Come back and your account will be ready.</p></div>{resent && <p className="form-notice">A fresh link is on its way. Older links will no longer work.</p>}{error && <p className="form-error">{error}</p>}<button className="button button--sun button--full" onClick={onDraft}>Continue drafting while I wait <ArrowRight /></button><div className="confirmation-links"><button onClick={resend} disabled={busy}>{busy ? "Sending…" : "Resend email"}</button><button onClick={() => { setConfirmationSent(false); setResent(false); }}>Change email</button></div><small>Your draft stays on this device until your account is confirmed.</small></div></div>;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal signup-modal" role="dialog" aria-modal="true" aria-labelledby="signup-title" onMouseDown={event => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Close"><X /></button><p className="eyebrow eyebrow--pink">{signin ? "WELCOME BACK" : "SAVE IT PROPERLY"}</p><h2 id="signup-title">{signin ? "Pick up your plan." : "Create your account."}</h2><p>{signin ? "Your wishes and access list will be right where you left them." : `Keep your draft across devices, then choose ${plan === "lifetime" ? "£75 lifetime" : "£29 annual"} when you are ready.`}</p><form onSubmit={submit}>{!signin && <label>Your name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Alex Smith" /></label>}<label>Email address<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="alex@example.com" /></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></label>{!signin && <label className="check-label"><input type="checkbox" checked={form.consent} onChange={event => setForm({ ...form, consent: event.target.checked })} /><span>Send me occasional, useful Good Grief emails. Optional.</span></label>}{error && <p className="form-error">{error}</p>}<button className="button button--sun button--full" disabled={busy}>{busy ? "One moment…" : signin ? "Sign in" : "Create account"} <ArrowRight /></button></form>{!signin && <button className="text-link signup-draft-link" onClick={onDraft}>Keep exploring without an account <ArrowRight /></button>}<small>{isLiveBackend ? "Account protected by Supabase Auth." : "Local preview mode. Production never bypasses account or payment checks."}</small></div></div>;
}

function AuthCallback({ onContinue }) {
  const [state, setState] = useState("checking");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  useEffect(() => { completeEmailConfirmation().then(() => setState("confirmed")).catch(err => { setError(err.message); setState("expired"); }); }, []);
  const resend = async event => { event.preventDefault(); setState("sending"); try { await resendConfirmation(email); setResent(true); setState("expired"); } catch (err) { setError(err.message); setState("expired"); } };
  return <main className="auth-callback"><header><Brand /><span><LockKey weight="fill" /> Secure account check</span></header><section><div className={`auth-result auth-result--${state}`}>{state === "checking" ? <><div className="auth-spinner" /><p className="eyebrow eyebrow--pink">CHECKING YOUR LINK</p><h1>Just a moment.</h1><p>We’re safely confirming your Good Grief account.</p></> : state === "confirmed" ? <><CheckCircle size={54} weight="fill" /><p className="eyebrow eyebrow--pink">EMAIL CONFIRMED</p><h1>You’re in.</h1><p>Your account is ready. Any draft already on this device is waiting for you.</p><button className="button button--sun" onClick={onContinue}>Continue my plan <ArrowRight /></button></> : <><WarningCircle size={54} weight="fill" /><p className="eyebrow eyebrow--pink">THAT LINK HAS EXPIRED</p><h1>Let’s send a fresh one.</h1><p>Email links are single-use and time-limited. Enter the address you used and we’ll send another.</p><form onSubmit={resend}><label>Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="alex@example.com" /></label><button className="button button--sun button--full" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send a new confirmation link"}</button></form>{resent && <p className="form-notice">Fresh link sent. Please use the newest email.</p>}{error && !resent && <p className="form-error">{error}</p>}<button className="text-link" onClick={onContinue}>Continue drafting without signing in <ArrowRight /></button></>}</div></section></main>;
}

function PaymentModal({ plan, onClose, onPaid, referralDiscount = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [configuration, setConfiguration] = useState({ loading: true, configured: false });
  useEffect(() => { getPaymentConfiguration().then(setConfiguration).catch(() => setConfiguration({ configured: false, mode: "unavailable" })); }, []);
  const proceed = async () => {
    setBusy(true); setError("");
    try {
      const result = await startCheckout(plan);
      if (result.url) window.location.assign(result.url);
      else onPaid();
    } catch (err) { setError(err.message || "Unable to start checkout."); setBusy(false); }
  };
  const annualPrice = referralDiscount ? "£14.50 for year one." : "£29 per year.";
  return <div className="modal-backdrop"><div className="modal payment-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X /></button><div className="payment-icon"><LockKey size={28} weight="fill" /></div><p className="eyebrow">SECURE CHECKOUT</p><h2>{plan === "lifetime" ? "£75 once." : annualPrice}</h2>{referralDiscount && plan === "annual" && <div className="discount-callout"><Tag weight="fill" /> Invitation discount applied: 50% off your first year.</div>}{configuration.loading ? <p>Checking the secure checkout connection…</p> : configuration.configured ? <><p>Continue to Stripe to complete payment. Your membership is activated only after Stripe confirms it.</p>{error && <p className="form-error">{error}</p>}<button className="button button--ink button--full" onClick={proceed} disabled={busy}>{busy ? "Opening Stripe…" : `Open ${configuration.mode === "test" ? "test " : ""}Stripe checkout`} <ArrowRight /></button></> : <div className="payment-not-connected"><WarningCircle weight="fill" /><div><b>Stripe isn’t connected yet.</b><span>No payment can be taken until a Stripe sandbox or live account is added. You can keep exploring and drafting for free.</span></div></div>}<p className="stripe-note">Payments are handled by Stripe. Good Grief never stores your card details.</p></div></div>;
}

function AccessModal({ onClose }) {
  const [summary, setSummary] = useState({ peopleWithAccess: [], plansSharedWithMe: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => { try { setSummary(await getAccessSummary()); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);
  const revoke = async (id) => { try { setSummary(await revokeAccess(id)); } catch (err) { setError(err.message); } };
  return <div className="modal-backdrop"><div className="modal access-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X /></button><p className="eyebrow eyebrow--pink">PLAN ACCESS</p><h2>Who can see what.</h2><p>Sharing is one-way. Someone seeing your plan does not automatically let you see theirs.</p>{loading ? <p>Loading access…</p> : <div className="access-sections"><section><h3><UsersThree weight="fill" /> People with access to my plan</h3>{summary.peopleWithAccess.length ? summary.peopleWithAccess.map(person => <article className="access-person" key={person.id}><div><b>{person.invited_email}</b><span className={`access-status access-status--${person.status}`}>{person.status}</span></div><button onClick={() => revoke(person.id)} aria-label={`Revoke access for ${person.invited_email}`}><Trash /></button></article>) : <p className="empty-access">Nobody has access yet.</p>}</section><section><h3><Eye weight="fill" /> Plans shared with me</h3>{summary.plansSharedWithMe.length ? summary.plansSharedWithMe.map(item => <article className="access-person" key={item.id}><div><b>{item.owner?.full_name || item.owner?.email || "Good Grief member"}</b><span className="access-status access-status--accepted">read only</span></div></article>) : <p className="empty-access">Nobody has shared a plan with you yet.</p>}</section></div>}{error && <p className="form-error">{error}</p>}</div></div>;
}

function ShareModal({ answers, membership, onClose, onPay, onOpenAccess }) {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [permissions, setPermissions] = useState(productAreas.map(area => area.key));
  const togglePermission = key => setPermissions(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { if (!permissions.length) throw new Error("Choose at least one area to share."); const result = await createInvite(email, answers, permissions); setInviteUrl(result.inviteUrl); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const copy = async () => { await navigator.clipboard?.writeText(inviteUrl); setCopied(true); };
  if (!membership?.paid) return <div className="modal-backdrop"><div className="modal share-modal share-locked"><button className="modal-close" onClick={onClose} aria-label="Close"><X /></button><div className="payment-icon"><LockKey size={28} weight="fill" /></div><p className="eyebrow eyebrow--pink">Paid membership required</p><h2>Build your plan. Unlock sharing.</h2><p>You can keep placing blocks for free. Invitations become available after Stripe confirms an Annual or Lifetime payment.</p><button className="button button--sun button--full" onClick={() => onPay("annual")}>Unlock for £29/year <ArrowRight /></button><button className="button button--ghost button--full" onClick={() => onPay("lifetime")}>Choose £75 lifetime</button></div></div>;
  return <div className="modal-backdrop"><div className="modal share-modal"><button className="modal-close" onClick={onClose} aria-label="Close"><X /></button><p className="eyebrow eyebrow--pink">Invite someone you trust</p><h2>{inviteUrl ? "Invitation ready." : "Who should see what?"}</h2>{!inviteUrl ? <><p>Enter the email address they must use, then choose the areas they can see. Nobody automatically gets everything.</p><form onSubmit={submit}><label>Their email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="someone@example.com" /></label><fieldset className="permission-picker"><legend>They can see</legend>{productAreas.map(area => <label key={area.key}><input type="checkbox" checked={permissions.includes(area.key)} onChange={() => togglePermission(area.key)} /><span>{area.title}</span></label>)}</fieldset>{error && <p className="form-error">{error}</p>}<button className="button button--sun button--full" disabled={busy}>{busy ? "Creating invitation…" : "Create private invitation"} <UserPlus /></button></form><div className="invite-benefit"><Tag weight="fill" /><div><b>A useful thank-you.</b><span>After accepting, they receive 50% off the first year of their own Annual plan.</span></div></div></> : <><p>The plan stays hidden until <b>{email}</b> signs in and accepts. They will only see the areas you selected.</p><label>Invitation link<div className="share-link"><span>{inviteUrl}</span><button onClick={copy}>{copied ? <Check /> : <Copy />}</button></div></label><button className="button button--ink button--full" onClick={copy}>{copied ? "Copied" : "Copy invitation"}<Copy /></button></>}<button className="text-link access-link" onClick={onOpenAccess}><UsersThree /> See everyone with access</button></div></div>;
}

function PlanHome({ answers, membership, ownerName, updatedAt, recentlySorted, onEdit, onReview, onMembership }) {
  const progress = calculateProgress(answers);
  const nextStep = Math.max(0, planSteps.findIndex(step => getBlockStatus(answers, step.areaKey, step.field) !== "sorted"));
  const date = updatedAt ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(updatedAt)) : "Today";
  return <section className="planner-home plan-board-home"><header className="plan-board-intro"><div><p className="eyebrow eyebrow--pink">{ownerName ? `Hello, ${ownerName}` : "My Good Grief"}</p><h1>Your plan,<br /><span>piece by piece.</span></h1><p>Put one useful block in place now. Leave the rest for another day.</p><div className="planner-home-actions"><button className="button button--sun" onClick={() => progress.completed === progress.total ? onReview() : onEdit(nextStep)}>{progress.completed === progress.total ? "Open my completed plan" : progress.completed || progress.drafted ? "Place the next block" : "Place my first block"} <ArrowRight /></button><button className="button button--ghost" onClick={onReview}>Open my plan <FileText /></button></div></div><div className="board-tally" aria-label={`${progress.completed} of ${progress.total} blocks sorted`}><Cube size={34} weight="fill" /><b>{progress.completed}</b><span>blocks in place</span><small>{progress.completed === progress.total ? "Plan complete" : progress.drafted ? `${progress.drafted} ${progress.drafted === 1 ? "draft" : "drafts"} waiting` : "Start anywhere"}</small></div></header>{recentlySorted && <div className="sorted-banner" role="status" aria-live="polite"><SealCheck size={32} weight="fill" /><div><b>{recentlySorted} is sorted.</b><span>That’s one less thing to leave to guesswork.</span></div></div>}<div className="plan-board" aria-label="Your Good Grief Plan Board">{productAreas.map((area, areaIndex) => { const steps = planSteps.filter(item => item.areaKey === area.key); const sorted = steps.filter(item => getBlockStatus(answers, item.areaKey, item.field) === "sorted").length; const drafts = steps.filter(item => getBlockStatus(answers, item.areaKey, item.field) === "draft").length; const complete = sorted === steps.length; return <section className={`plan-stack plan-stack--${area.colour}`} key={area.key}><header><div><small>Area {String(areaIndex + 1).padStart(2, "0")}</small><h2>{area.title}</h2></div>{complete ? <span className="area-badge"><SealCheck weight="fill" /> {area.title.replace("My ", "")} sorted</span> : <span className="stack-count">{sorted}/{steps.length} sorted{drafts ? ` · ${drafts} draft` : ""}</span>}</header><div className="block-stack">{steps.map((item) => { const index = planSteps.findIndex(step => step.key === item.key); const blockStatus = getBlockStatus(answers, item.areaKey, item.field); return <button className={`plan-block plan-block--${blockStatus}`} key={item.key} onClick={() => onEdit(index)} aria-label={`${item.title}, ${blockStatus}`}><span className="block-mark">{blockStatus === "sorted" ? <Check weight="bold" /> : blockStatus === "draft" ? <PencilSimple weight="fill" /> : <Cube weight="fill" />}</span><span className="block-copy"><small>{blockStatus === "sorted" ? "Sorted" : blockStatus === "draft" ? "Draft" : "Not started"}</small><b>{item.title}</b></span><CaretRight weight="bold" /></button>; })}</div></section>; })}</div><div className="planner-home-lower"><article className="readiness-card"><p className="eyebrow">Ready when it matters</p><h2>One clear source.</h2><div className="readiness-list"><p><CheckCircle weight="fill" /><span><b>Always current</b> with automatic saving.</span></p><p><CheckCircle weight="fill" /><span><b>Private by design</b> and visible only to people you choose.</span></p><p><CheckCircle weight="fill" /><span><b>No passwords needed.</b> Record where important things can safely be found.</span></p></div></article><article className="member-card"><div className="member-card-top"><span><CreditCard weight="fill" /></span><small>Membership</small></div><h2>{membership.paid ? `${membership.membershipType === "lifetime" ? "Lifetime" : "Annual"} member` : "Draft membership"}</h2><p>{membership.paid ? "Your living plan and trusted sharing are unlocked." : "Build for free. Upgrade when you’re ready to share your living plan."}</p><button className="text-link" onClick={onMembership}>View membership <ArrowRight /></button><footer>Last updated {date}</footer></article></div></section>;
}

function PlanReview({ answers, updatedAt, onEdit, onAccess }) {
  const progress = calculateProgress(answers);
  const date = updatedAt ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(updatedAt)) : "today";
  return <section className="plan-review living-plan-view"><div className="review-heading"><div><p className="eyebrow eyebrow--pink">My living plan</p><h1>Everything useful.<br /><span>Right here.</span></h1><p>This is the version that matters. Keep it current, edit any block and choose exactly who can see each area.</p></div><div className="review-actions"><button className="button button--sun" onClick={onAccess}>Manage trusted access <UsersThree /></button><span className="living-plan-updated"><CheckCircle weight="fill" /> Updated {date}</span></div></div><div className="living-plan-summary"><Cube size={26} weight="fill" /><b>{progress.completed} of {progress.total} blocks sorted</b>{progress.drafted > 0 && <span>{progress.drafted} {progress.drafted === 1 ? "draft" : "drafts"} still to confirm</span>}</div><div className="living-area-list">{productAreas.map((area, areaIndex) => { const steps = planSteps.filter(item => item.areaKey === area.key); const sorted = steps.filter(item => getBlockStatus(answers, item.areaKey, item.field) === "sorted").length; return <section className={`living-area living-area--${area.colour}`} key={area.key}><header><span>{String(areaIndex + 1).padStart(2, "0")}</span><div><h2>{area.title}</h2><p>{sorted} of {steps.length} sorted</p></div>{sorted === steps.length && <SealCheck size={34} weight="fill" aria-label="Area sorted" />}</header><div>{steps.map(item => { const index = planSteps.findIndex(step => step.key === item.key); const status = getBlockStatus(answers, item.areaKey, item.field); const value = answerFor(answers, item); return <article className={`living-block living-block--${status}`} key={item.key}><span className="block-status"><i>{status === "sorted" ? <Check weight="bold" /> : status === "draft" ? <PencilSimple weight="fill" /> : <Cube weight="fill" />}</i>{status === "sorted" ? "Sorted" : status === "draft" ? "Draft" : "Not started"}</span><div><h3>{item.title}</h3>{value ? <p>{value}</p> : <p className="living-block-empty">Nothing added yet.</p>}</div><button onClick={() => onEdit(index)} aria-label={`Edit ${item.title}`}>{value ? "Edit" : "Add"} <ArrowRight /></button></article>; })}</div></section>; })}</div></section>;
}

function MembershipView({ membership, onPay }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const renewal = membership.currentPeriodEnd ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(membership.currentPeriodEnd)) : "Shown after first payment";
  const manage = async () => { setBusy(true); setError(""); try { const result = await openBillingPortal(); if (result.url) window.location.assign(result.url); else setError("Billing portal preview: live Stripe details appear here once connected."); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const remove = async () => { setBusy(true); setError(""); try { await deleteAccount(); window.location.assign("/"); } catch (err) { setError(err.message); setBusy(false); } };
  return <section className="membership-view"><p className="eyebrow eyebrow--pink">My membership</p><h1>Simple payment.<br /><span>Proper peace of mind.</span></h1><div className="membership-panel"><div className="membership-panel-status"><span><CreditCard size={28} weight="fill" /></span><div><small>Current plan</small><h2>{membership.paid ? membership.membershipType === "lifetime" ? "Lifetime membership" : "Annual membership" : "No active membership"}</h2><p>{membership.paid ? membership.membershipType === "lifetime" ? "Paid once. Your living plan and trusted sharing stay unlocked." : "£29 per year. Your living plan and trusted sharing stay available while active." : "Keep building for free, then unlock the complete Good Grief experience."}</p></div><b className={membership.paid ? "status-active" : "status-draft"}>{membership.paid ? "Active" : "Draft"}</b></div><div className="billing-facts"><div><small>Price</small><b>{membership.paid ? membership.membershipType === "lifetime" ? "£75 once" : "£29 / year" : "Not purchased"}</b></div><div><small>{membership.membershipType === "lifetime" ? "Access" : "Next renewal"}</small><b>{membership.membershipType === "lifetime" ? "No expiry" : renewal}</b></div><div><small>Payments</small><b>Securely handled by Stripe</b></div></div><div className="membership-benefits"><p><Check /> Twenty guided building blocks</p><p><Check /> One living plan, always current</p><p><Check /> Account-protected invitations</p><p><Check /> Unlimited updates and access control</p></div><div className="membership-actions">{membership.paid && membership.membershipType === "annual" ? <button className="button button--ink" onClick={manage} disabled={busy}>{busy ? "Opening Stripe…" : "Update card, invoices & billing"}<ArrowSquareOut /></button> : !membership.paid ? <><button className="button button--sun" onClick={() => onPay("annual")}>Choose £29 annual <ArrowRight /></button><button className="button button--ghost" onClick={() => onPay("lifetime")}>Choose £75 lifetime</button></> : <p><ShieldCheck weight="fill" /> No renewal or recurring payment.</p>}</div>{error && <p className="form-error">{error}</p>}<small>Card details and invoices are handled securely by Stripe. Good Grief never stores your card number.</small></div></section>;
}

function Planner({ onHome }) {
  const initialView = new URLSearchParams(window.location.search).get("view") || "home";
  const [answers, setAnswers] = useState(() => normalizePlan(loadPlan()));
  const [view, setView] = useState(initialView);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("Loading your plan…");
  const [hydrated, setHydrated] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const [membership, setMembership] = useState({ paid: false, paymentStatus: "checking" });
  const [shareOpen, setShareOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [accountPlan, setAccountPlan] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [recentlySorted, setRecentlySorted] = useState("");
  const completed = calculateProgress(answers).completed;
  const refreshMembership = async () => { try { const next = await getEntitlement(); setMembership(next); return next; } catch { const next = { paid: false, paymentStatus: "unpaid" }; setMembership(next); return next; } };
  useEffect(() => { (async () => { try { const [user, stored] = await Promise.all([currentUser(), loadCloudPlan()]); setOwnerName(user?.user_metadata?.full_name || user?.name || ""); const loadedAnswers = stored?.answers || stored || {}; setAnswers(normalizePlan(loadedAnswers)); setUpdatedAt(stored?.updatedAt || null); setStatus("Saved securely"); } catch { setStatus("Saved on this device"); } finally { setHydrated(true); } })(); }, []);
  useEffect(() => { const checkout = new URLSearchParams(window.location.search).get("checkout"); refreshMembership().then(result => { if (checkout === "success") setCheckoutNotice(result.paid ? "Payment confirmed. Your living plan and trusted sharing are unlocked." : "Payment received. Stripe is confirming your membership…"); }); if (checkout === "success") { const timer = setTimeout(() => refreshMembership().then(result => result.paid && setCheckoutNotice("Payment confirmed. Your living plan and trusted sharing are unlocked.")), 2200); return () => clearTimeout(timer); } }, []);
  useEffect(() => { if (!hydrated) return; setStatus("Saving…"); const timer = setTimeout(async () => { try { await persistPlan(answers); setUpdatedAt(new Date().toISOString()); setStatus("Saved securely"); } catch { setStatus("Saved on this device"); } }, 650); return () => clearTimeout(timer); }, [answers, hydrated]);
  const current = planSteps[step];
  const openEditor = index => { setRecentlySorted(""); setStep(index); setView("edit"); window.history.replaceState({}, "", "/planner?view=edit"); };
  const openPayment = async plan => { setShareOpen(false); const user = await currentUser(); if (user) setPaymentPlan(plan); else setAccountPlan(plan); };
  const nav = next => { setView(next); window.history.replaceState({}, "", `/planner?view=${next}`); };
  const currentValue = answerFor(answers, current);
  const secretWarning = containsSensitiveSecret(currentValue);
  const currentBlockStatus = getBlockStatus(answers, current.areaKey, current.field);
  const updateCurrentValue = value => setAnswers(currentAnswers => updateBlockAnswer(currentAnswers, current.areaKey, current.field, value));
  const addStarterPrompt = prompt => {
    const starter = `${prompt}:\n`;
    if (currentValue.includes(starter)) return;
    const nextValue = currentValue.trim() ? `${currentValue.trim()}\n\n${starter}` : starter;
    updateCurrentValue(nextValue);
  };
  const confirmBlock = () => {
    if (!currentValue.trim() || secretWarning) return;
    setAnswers(currentAnswers => markBlockSorted(currentAnswers, current.areaKey, current.field));
    setRecentlySorted(current.title);
    nav("home");
  };
  const editor = <section className="planner-main block-editor"><div className={`editor-block-card editor-block-card--${productAreas.find(area => area.key === current.areaKey)?.colour || "cream"}`}><span>Block {String(step + 1).padStart(2, "0")}</span><Cube size={42} weight="fill" /><h2>{current.title}</h2><div className={`editor-status editor-status--${currentBlockStatus}`}>{currentBlockStatus === "sorted" ? <Check weight="bold" /> : currentBlockStatus === "draft" ? <PencilSimple weight="fill" /> : <Cube weight="fill" />}{currentBlockStatus === "sorted" ? "Sorted" : currentBlockStatus === "draft" ? "Draft" : "Not started"}</div></div><div className="editor-workspace"><p className="eyebrow">{current.areaTitle} · block {step + 1} of {planSteps.length}</p><h1>{current.prompt}</h1><p>Use a prompt to get moving, or add only the detail that will genuinely help.</p><div className="starter-prompts" aria-label="Helpful prompts">{current.starterPrompts.map(prompt => <button key={prompt} onClick={() => addStarterPrompt(prompt)}><Sparkle weight="fill" />{prompt}</button>)}</div><label className="block-notes">Useful details <span>Saved as a draft until you mark it sorted.</span><textarea value={currentValue} onChange={event => updateCurrentValue(event.target.value)} placeholder={current.placeholder} autoFocus /></label>{secretWarning && <p className="secret-warning"><WarningCircle weight="fill" />Please remove passwords, PINs or card details. Record where they are safely stored instead.</p>}<div className="planner-controls"><button className="button button--ghost" onClick={() => nav("home")}><ArrowLeft /> Back to board</button><button className="button button--ink mark-sorted-button" disabled={!currentValue.trim() || secretWarning} onClick={confirmBlock}><SealCheck size={22} weight="fill" />{currentBlockStatus === "sorted" ? "Confirm this is sorted" : "Mark this sorted"}</button></div></div></section>;
  const mainContent = view === "home" ? <PlanHome answers={answers} membership={membership} ownerName={ownerName} updatedAt={updatedAt} recentlySorted={recentlySorted} onEdit={openEditor} onReview={() => nav("review")} onMembership={() => nav("membership")} /> : view === "review" ? <PlanReview answers={answers} updatedAt={updatedAt} onEdit={openEditor} onAccess={() => setAccessOpen(true)} /> : view === "membership" ? <MembershipView membership={membership} onPay={openPayment} /> : editor;
  return <main className="planner-shell"><header className="planner-header"><Brand /><div className="planner-save"><CheckCircle weight="fill" />{status}</div><div><button className="planner-text-button" onClick={onHome}>Exit</button><button className="button button--sun" onClick={() => setShareOpen(true)}>{membership.paid ? "Invite someone" : "Unlock full plan"} <ArrowRight /></button></div></header>{checkoutNotice && <div className={`checkout-notice ${membership.paid ? "checkout-notice--success" : ""}`}><CheckCircle weight="fill" /><span>{checkoutNotice}</span><button onClick={() => setCheckoutNotice("")} aria-label="Dismiss"><X /></button></div>}<div className="planner-layout planner-layout--hub"><aside><p className="eyebrow eyebrow--pink">My Good Grief</p><nav className="hub-nav"><button className={view === "home" ? "active" : ""} onClick={() => nav("home")}><House /><span>Plan Board</span></button><button className={view === "edit" ? "active" : ""} onClick={() => openEditor(Math.max(0, planSteps.findIndex(item => getBlockStatus(answers, item.areaKey, item.field) !== "sorted")))}><Cube /><span>Build my plan</span></button><button className={view === "review" ? "active" : ""} onClick={() => nav("review")}><FileText /><span>My plan</span></button><button onClick={() => setAccessOpen(true)}><UsersThree /><span>Who has access?</span></button><button className={view === "membership" ? "active" : ""} onClick={() => nav("membership")}><CreditCard /><span>Membership</span></button></nav><div className="hub-progress"><div><b>{completed}</b><span>of {planSteps.length}<br />blocks in place</span></div><div className="progress"><i style={{ width: `${completed / planSteps.length * 100}%` }} /></div></div>{view === "edit" && <nav className="step-nav">{planSteps.map((item, index) => { const blockStatus = getBlockStatus(answers, item.areaKey, item.field); return <button key={item.key} className={`${index === step ? "active" : ""} ${blockStatus === "sorted" ? "done" : blockStatus === "draft" ? "draft" : ""}`} onClick={() => setStep(index)}><span>{blockStatus === "sorted" ? <Check weight="bold" /> : blockStatus === "draft" ? <PencilSimple weight="fill" /> : index + 1}</span>{item.title}</button>; })}</nav>}<div className={`membership-chip ${membership.paid ? "membership-chip--paid" : ""}`}><LockKey weight="fill" /><span>{membership.paid ? `${membership.membershipType} member · living plan and sharing unlocked` : "Drafting mode · sharing locked"}</span></div></aside><div className="planner-content">{mainContent}</div></div>{shareOpen && <ShareModal answers={answers} membership={membership} onClose={() => setShareOpen(false)} onPay={openPayment} onOpenAccess={() => { setShareOpen(false); setAccessOpen(true); }} />}{accessOpen && <AccessModal onClose={() => setAccessOpen(false)} />}{accountPlan && <SignupModal plan={accountPlan} mode="signup" onClose={() => setAccountPlan(null)} onDraft={() => setAccountPlan(null)} onComplete={plan => { setAccountPlan(null); setPaymentPlan(plan); }} />}{paymentPlan && <PaymentModal plan={paymentPlan} onClose={() => setPaymentPlan(null)} onPaid={() => { setPaymentPlan(null); refreshMembership(); nav("home"); }} referralDiscount={membership.referralDiscountAvailable} />}</main>;
}

function SharedPlan({ token }) {
  const [user, setUser] = useState(null);
  const [shared, setShared] = useState(null);
  const [membership, setMembership] = useState(null);
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "", consent: false });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const unlock = async () => { await acceptInvite(token); setShared(await loadSharedPlan(token)); setMembership(await getEntitlement()); };
  useEffect(() => { (async () => { try { const found = await currentUser(); setUser(found); if (found) await unlock(); } catch (err) { setError(err.message); } finally { setLoading(false); } })(); }, [token]);
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = mode === "signin" ? await signIn(form) : await createAccount({ ...form, plan: "annual" });
      if (result.requiresConfirmation) { setError("Confirm your email, then return to this invitation and sign in."); return; }
      setUser(result.user); await unlock();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  if (loading) return <main className="shared-page"><header><Brand /><span><LockKey weight="fill" /> Account-protected plan</span></header><section><div className="missing-share"><h2>Checking your invitation…</h2></div></section></main>;
  if (!user || !shared) return <main className="shared-page shared-gate"><header><Brand /><span><LockKey weight="fill" /> Account-protected plan</span></header><section><div className="invite-gate-copy"><p className="eyebrow eyebrow--pink">SOMEONE TRUSTS YOU WITH THIS</p><h1>Sign in before you see it.</h1><p>This invitation is tied to one email address. Create a free Good Grief account—or sign in—before the plan is revealed.</p><div className="invite-benefit invite-benefit--large"><Tag weight="fill" /><div><b>Accepting comes with 50% off.</b><span>Start your own £29 Annual plan for £14.50 in year one.</span></div></div></div><div className="invite-auth-card"><div className="auth-tabs"><button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button><button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button></div><form onSubmit={submit}>{mode === "signup" && <label>Your name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>}<label>Email address<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="button button--sun button--full" disabled={busy}>{busy ? "Checking invitation…" : mode === "signup" ? "Create account & accept" : "Sign in & accept"}<ArrowRight /></button></form><small>The plan remains private if this email does not match the invitation.</small></div></section></main>;
  const sharedAnswers = normalizePlan(shared.answers);
  return <main className="shared-page"><header><Brand /><span><LockKey weight="fill" /> Read-only Good Grief plan</span></header><section>{membership?.referralDiscountAvailable && !membership?.paid && <div className="referral-banner"><Tag weight="fill" /><div><b>Your invitation benefit</b><span>50% off your first year: £14.50 today, then £29/year.</span></div><button className="button button--sun" onClick={() => setPaymentOpen(true)}>Start my own plan <ArrowRight /></button></div>}<p className="eyebrow eyebrow--pink">{shared.ownerName} trusts you with this</p><h1>The things they want you to know.</h1><div className="shared-grid">{planSteps.filter(step => answerFor(sharedAnswers, step)).map(step => <article key={step.key}><p>{step.areaTitle} · {step.title}</p><h2>{step.prompt}</h2><div>{answerFor(sharedAnswers, step)}</div></article>)}</div>{paymentOpen && <PaymentModal plan="annual" referralDiscount onClose={() => setPaymentOpen(false)} onPaid={() => window.location.assign("/planner")} />}</section></main>;
}

export function App() {
  const shareToken = window.location.pathname.match(/^\/shared\/([^/]+)/)?.[1];
  const isAuthCallback = window.location.pathname.startsWith("/auth/callback");
  const [screen, setScreen] = useState(window.location.pathname.startsWith("/planner") ? "planner" : "home");
  const [modal, setModal] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [paymentConfiguration, setPaymentConfiguration] = useState({ loading: true, configured: false });
  useEffect(() => { getPaymentConfiguration().then(setPaymentConfiguration).catch(() => setPaymentConfiguration({ configured: false, mode: "unavailable" })); }, []);
  const begin = () => { window.history.replaceState({}, "", "/planner"); setScreen("planner"); };
  const pick = plan => { setSelectedPlan(plan); setModal(paymentConfiguration.configured ? "signup" : "payment"); };
  if (isAuthCallback) return <AuthCallback onContinue={() => window.location.assign("/planner")} />;
  if (shareToken) return <SharedPlan token={shareToken} />;
  if (screen === "planner") return <Planner onHome={() => { window.history.replaceState({}, "", "/"); setScreen("home"); }} />;
  return <><main><Hero onStart={begin} onSignIn={() => setModal("signin")} /><Manifesto /><ProductAreas /><HowItWorks onStart={begin} /><PreviewSection /><Trust /><Pricing onPick={pick} /><FAQ /></main><Footer onStart={begin} />{(modal === "signup" || modal === "signin") && <SignupModal plan={selectedPlan} mode={modal} onClose={() => setModal(null)} onDraft={() => { setModal(null); begin(); }} onComplete={() => { if (modal === "signin") { setModal(null); window.history.replaceState({}, "", "/planner"); setScreen("planner"); } else { setModal("payment"); } }} />}{modal === "payment" && <PaymentModal plan={selectedPlan} onClose={() => setModal(null)} onPaid={() => { setModal(null); window.history.replaceState({}, "", "/planner"); setScreen("planner"); }} />}</>;
}
