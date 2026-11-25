export type ForwardStatus = "sent" | "failed" | "not_configured" | "timeout";

export async function forwardToGrokbot(
  payload: unknown,
): Promise<{ forward_status: ForwardStatus; error?: string }> {
  const url = process.env.GROKBOT_WEBHOOK_URL?.trim();
  const key = process.env.GROKBOT_WEBHOOK_KEY?.trim();
  if (!url || !key) {
    return { forward_status: "not_configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "X-Automation-Key": key,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) return { forward_status: "sent" };
    return {
      forward_status: "failed",
      error: `Webhook HTTP ${res.status}`,
    };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      return { forward_status: "timeout", error: "Webhook timeout (8s)" };
    }
    return {
      forward_status: "failed",
      error: err instanceof Error ? err.message : "Webhook forward failed",
    };
  }
}