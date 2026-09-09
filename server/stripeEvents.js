export function periodEndFromInvoice(invoice) {
  const periods = invoice?.lines?.data || [];
  const latest = periods.reduce((value, line) => Math.max(value, Number(line?.period?.end) || 0), 0);
  return latest ? new Date(latest * 1000).toISOString() : null;
}

export function shouldProcessEvent(record) {
  return !record || record.status === "failed";
}

export async function beginStripeEvent(admin, event) {
  const { data: existing, error: readError } = await admin
    .from("billing_events")
    .select("status,attempts")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (readError) throw readError;
  if (!shouldProcessEvent(existing)) return false;

  if (existing) {
    const { error } = await admin.from("billing_events").update({
      status: "processing",
      attempts: (existing.attempts || 1) + 1,
      error_message: null,
      updated_at: new Date().toISOString(),
    }).eq("stripe_event_id", event.id);
    if (error) throw error;
    return true;
  }

  const { error } = await admin.from("billing_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    status: "processing",
  });
  if (error?.code === "23505") return false;
  if (error) throw error;
  return true;
}

export async function completeStripeEvent(admin, eventId) {
  const now = new Date().toISOString();
  const { error } = await admin.from("billing_events").update({
    status: "completed",
    error_message: null,
    processed_at: now,
    updated_at: now,
  }).eq("stripe_event_id", eventId);
  if (error) throw error;
}

export async function failStripeEvent(admin, eventId, error) {
  await admin.from("billing_events").update({
    status: "failed",
    error_message: String(error?.message || error || "Unknown processing failure").slice(0, 500),
    updated_at: new Date().toISOString(),
  }).eq("stripe_event_id", eventId);
}
