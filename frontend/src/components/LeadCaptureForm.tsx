"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitLead, getUtmParams } from "@/lib/api";
import { trackLeadSubmit, trackFormStart } from "@/lib/gtm";

const SERVICES = [
  "Oil Change",
  "Brake Service",
  "Tire Rotation / Replacement",
  "AC / Heat Repair",
  "Engine Diagnostic",
  "Transmission Service",
  "Wheel Alignment",
  "Battery Replacement",
  "Other",
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z
    .string()
    .regex(/^\d{4}$/, "Enter a 4-digit year")
    .or(z.literal(""))
    .optional(),
  service: z.string().min(1, "Please select a service"),
});

type FormData = z.infer<typeof schema>;

interface LeadCaptureFormProps {
  shopName?: string;
  shopPhone?: string;
}

export default function LeadCaptureForm({
  shopName = "Auto Service",
  shopPhone = "",
}: LeadCaptureFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    const utm = getUtmParams();
    const source = (utm.utm_source?.includes("facebook")
      ? "fb_ad"
      : utm.utm_source?.includes("google")
      ? "google_search"
      : utm.utm_source
      ? "referral"
      : "organic") as "fb_ad" | "google_search" | "organic" | "referral";

    try {
      await submitLead({
        source,
        customer: { name: data.name, phone: data.phone, email: data.email || undefined },
        vehicle: {
          make: data.make,
          model: data.model,
          year: data.year,
          service_needed: data.service,
        },
        attribution: {
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          ga4_client_id:
            typeof window !== "undefined"
              ? (window as any).gtag?.("get", process.env.NEXT_PUBLIC_GTM_ID, "client_id")
              : undefined,
        },
      });
      trackLeadSubmit(data.service, source);
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please call us directly.");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl text-center space-y-4 animate-fade-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">You're All Set!</h3>
        <p className="text-gray-600">
          Thanks for reaching out to <strong>{shopName}</strong>. A service advisor will call
          you within <strong>30 minutes</strong> to confirm your appointment.
        </p>
        {shopPhone && (
          <p className="text-sm text-gray-500">
            Need to talk now?{" "}
            <a href={`tel:${shopPhone}`} className="text-brand-600 font-semibold hover:underline">
              Call {shopPhone}
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocus={() => trackFormStart("lead-capture")}
      className="rounded-2xl bg-white p-6 md:p-8 shadow-xl space-y-5 animate-fade-up"
    >
      <h2 className="text-2xl font-bold text-gray-900">Get a Free Estimate</h2>
      <p className="text-sm text-gray-500">No spam. A real advisor will call you shortly.</p>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
        <input
          {...register("name")}
          placeholder="Jane Smith"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <input
          {...register("phone")}
          type="tel"
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="jane@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed *</label>
        <select
          {...register("service")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
        >
          <option value="">Select a service…</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service.message}</p>}
      </div>

      {/* Vehicle row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            {...register("year")}
            placeholder="2020"
            maxLength={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
          {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
          <input
            {...register("make")}
            placeholder="Toyota"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <input
            {...register("model")}
            placeholder="Camry"
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        data-gtm-cta="lead-form-submit"
        className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-bold py-4 text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        {isSubmitting ? "Sending…" : "Get My Free Estimate →"}
      </button>

      <p className="text-center text-xs text-gray-400">
        By submitting you agree to be contacted about your service request.
      </p>
    </form>
  );
}
