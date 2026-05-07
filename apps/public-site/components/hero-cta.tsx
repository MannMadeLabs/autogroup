"use client";

import { pushDataLayerEvent } from "@/lib/gtm";

export function HeroCta(): JSX.Element {
  const handleClick = () => {
    pushDataLayerEvent("cta_click", {
      cta_name: "request_quote",
      placement: "hero"
    });
  };

  return (
    <button
      className="rounded-md bg-brand px-4 py-2 text-white transition hover:bg-brand-accent"
      onClick={handleClick}
    >
      Request a Service Quote
    </button>
  );
}
