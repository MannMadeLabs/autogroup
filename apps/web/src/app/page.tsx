export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
        Project Apex
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900">
        Mann Auto Group
      </h1>
      <p className="mt-4 text-lg text-neutral-600">
        High-performance landing experience — lead capture and Core Web Vitals come next.
      </p>
      <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Logic engine (local)</p>
        <code className="mt-2 block text-sm text-neutral-800">
          POST http://localhost:8000/webhook/new-lead
        </code>
      </div>
    </main>
  );
}
