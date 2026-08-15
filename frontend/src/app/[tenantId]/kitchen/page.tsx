import KitchenPage from '@/modules/coffee/kitchen/KitchenPage';

export default async function TenantKitchenPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = await params;

  if (resolvedParams.tenantId === 'coffee') {
    return <KitchenPage />;
  }

  return (
    <div className="p-8 text-center fixed inset-0 bg-white z-[100] flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">Màn hình bếp cho {resolvedParams.tenantId} chưa khả dụng.</h1>
    </div>
  );
}
