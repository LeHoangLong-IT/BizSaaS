export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-[#E3C9AD] font-sans relative pb-24">
      {/* Global Coffee Header */}
      <header className="p-4 text-center bg-surface-dark shadow-md relative z-10">
        <h1 className="text-2xl font-serif italic tracking-wide text-primary-light mb-0">
          BizSaaS Coffee
        </h1>
      </header>

      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
