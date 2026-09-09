import test from "node:test";
import assert from "node:assert/strict";

import { buildInviteEmail } from "../server/inviteEmail.js";

test("the invitation email contains the private Good Grief link", () => {
  const message = buildInviteEmail({
    ownerName: "Jonny",
    inviteUrl: "https://getgoodgrief.co.uk/shared/private-token",
  });

  assert.match(message.subject, /Jonny has shared/i);
  assert.match(message.html, /https:\/\/getgoodgrief\.co\.uk\/shared\/private-token/);
  assert.match(message.html, /View the plan/);
  assert.match(message.text, /private-token/);
});

test("invitation email content escapes names and untrusted URLs", () => {
  const message = buildInviteEmail({
    ownerName: '<img src=x onerror="bad">',
    inviteUrl: 'https://example.test/shared/x?value="bad"&next=<script>',
  });

  assert.doesNotMatch(message.html, /<img|<script>/i);
  assert.match(message.html, /&lt;img/);
  assert.match(message.html, /&quot;bad&quot;&amp;next=&lt;script&gt;/);
});
