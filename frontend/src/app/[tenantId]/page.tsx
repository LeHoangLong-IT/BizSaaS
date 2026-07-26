import MenuPage from '@/modules/coffee/customer/MenuPage';
import KitchenPage from '@/modules/coffee/kitchen/KitchenPage';

export default async function TenantHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ table?: string; kds?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Routing nội bộ dựa vào tenantId
  if (resolvedParams.tenantId === 'coffee') {
    if (resolvedSearchParams.kds === 'true') {
      return <KitchenPage />;
    }
    return <MenuPage tableId={resolvedSearchParams.table || '1'} />;
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Cửa hàng {resolvedParams.tenantId} chưa được cấu hình giao diện.</h1>
    </div>
  );
}
