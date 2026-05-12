"use client";

import { useState } from "react";

interface BiasAlertBannerProps {
  alertId: string;
  message: string;
  accentColor: string;
  onDismiss?: (alertId: string) => Promise<void> | void;
}

export function BiasAlertBanner({
  alertId,
  message,
  accentColor,
  onDismiss,
}: BiasAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  async function handleDismiss() {
    setDismissed(true);
    try {
      await onDismiss?.(alertId);
    } catch {
      // se fallisce, l'utente non se ne accorge; al refresh ricompare
    }
  }

  if (dismissed) return null;

  return (
    <div
      className="rounded-3xl p-5 animate-fade-in"
      style={{ backgroundColor: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-1.5 h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-claria-ink/60">
            Una cosa che ho notato
          </p>
          <p className="mt-2 text-base text-claria-ink leading-relaxed">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-claria-ink/40 hover:text-claria-ink/70 p-1 -mr-1 text-xl leading-none"
          aria-label="Chiudi"
        >
          ×
        </button>
      </div>
    </div>
  );
}
