import AdminPage from '@/modules/coffee/admin/AdminPage';

export default async function TenantAdminPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = await params;

  if (resolvedParams.tenantId === 'coffee') {
    return <AdminPage tenantId={resolvedParams.tenantId} />;
  }

  return (
    <div className="p-8 text-center fixed inset-0 bg-white z-[100] flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">Trang quản trị cho {resolvedParams.tenantId} chưa khả dụng.</h1>
    </div>
  );
}
