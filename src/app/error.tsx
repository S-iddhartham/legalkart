"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="container flex flex-col items-center py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">Something went wrong loading this page</h1>
      <p className="mt-3 max-w-md text-ink-600">Please try again. If it keeps happening, contact support.</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
