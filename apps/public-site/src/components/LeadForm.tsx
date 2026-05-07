'use client';

import { useState, type FormEvent } from 'react';
import { pushEvent } from '@/lib/gtm';
import { detectSource } from '@/lib/source';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function LeadForm() {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const source = detectSource();

    const payload = {
      source,
      customer: {
        name: String(data.get('name') ?? '').trim(),
        phone: String(data.get('phone') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
      },
      vehicle: {
        make: String(data.get('make') ?? '').trim(),
        model: String(data.get('model') ?? '').trim(),
        service_needed: String(data.get('service_needed') ?? '').trim(),
      },
    };

    pushEvent({ event: 'lead_submit_attempt', source });
    setState('submitting');

    try {
      const res = await fetch(`${API_URL}/webhook/new-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const reason = `HTTP ${res.status}`;
        pushEvent({ event: 'lead_submit_error', source, reason });
        setError("Sorry - we couldn't submit your request. Please call us instead.");
        setState('error');
        return;
      }

      const lead = await res.json();
      pushEvent({ event: 'lead_submit_success', source, lead_id: lead.lead_id });
      setState('success');
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown';
      pushEvent({ event: 'lead_submit_error', source, reason });
      setError('Network error. Please try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl bg-white p-8 shadow-md ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-brand">You&apos;re on the list.</h2>
        <p className="mt-2 text-brand-muted">
          One of our advisors will reach out within the next hour with your quote.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200 sm:p-8"
      aria-label="Get a service quote"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Full name" required autoComplete="name" />
        <Field name="phone" label="Phone" type="tel" required autoComplete="tel" />
      </div>
      <Field name="email" label="Email" type="email" required autoComplete="email" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="make" label="Vehicle make" required placeholder="Toyota" />
        <Field name="model" label="Vehicle model" required placeholder="Camry" />
      </div>
      <Field
        name="service_needed"
        label="What service do you need?"
        required
        placeholder="Oil change, brakes, check engine light..."
      />

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={state === 'submitting'}
      >
        {state === 'submitting' ? 'Sending…' : 'Get my free quote'}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
};

function Field({ name, label, type = 'text', required, autoComplete, placeholder }: FieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-brand">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-brand
                   shadow-sm transition focus:border-brand-accent focus:outline-none
                   focus:ring-2 focus:ring-brand-accent"
      />
    </label>
  );
}
