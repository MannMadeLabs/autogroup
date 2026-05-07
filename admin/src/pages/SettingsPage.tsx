export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage shop configuration and integrations</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
        <h2 className="font-semibold text-gray-900 border-b pb-3">Shop Information</h2>
        <div className="space-y-4">
          {[
            { label: "Shop Name", placeholder: "Auto Service Pro", key: "shop_name" },
            { label: "Phone Number", placeholder: "+1 (555) 000-0000", key: "shop_phone" },
            { label: "Google Review Link", placeholder: "https://g.page/r/...", key: "review_link" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
        <h2 className="font-semibold text-gray-900 border-b pb-3">Integration Status</h2>
        <div className="space-y-3">
          {[
            { name: "Twilio SMS", env: "TWILIO_ACCOUNT_SID", status: "configured" },
            { name: "SendGrid Email", env: "SENDGRID_API_KEY", status: "configured" },
            { name: "Google Analytics 4", env: "GA4_MEASUREMENT_ID", status: "configured" },
            { name: "Stripe Payments", env: "STRIPE_SECRET_KEY", status: "optional" },
          ].map((i) => (
            <div key={i.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{i.name}</p>
                <p className="text-xs text-gray-400 font-mono">{i.env}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                i.status === "configured" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {i.status === "configured" ? "Set via .env" : "Optional"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          Integration keys are managed via environment variables. See <code>.env.example</code> for the full list.
        </p>
      </div>
    </div>
  );
}
