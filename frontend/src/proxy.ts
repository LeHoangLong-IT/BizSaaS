import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Lấy hostname hiện tại (VD: shop1.localhost:3000)
  const hostname = req.headers.get('host') || '';

  // Bỏ qua các file tĩnh (ảnh, css) và các route nội bộ của Next.js
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Phân tích Subdomain. Sử dụng biến môi trường hoặc mặc định là localhost:3000
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  
  // Nếu truy cập thẳng vào domain gốc (bizsaas.com hoặc localhost:3000)
  if (hostname === rootDomain) {
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Nếu truy cập vào thư mục con (ví dụ: localhost:3000/coffee)
    if (pathParts.length > 0) {
      const potentialTenant = pathParts[0];
      // Danh sách các trang public chung của hệ thống (Marketing Page)
      const publicPages = ['about', 'pricing', 'login', 'register'];
      
      if (!publicPages.includes(potentialTenant)) {
        // Tự động chuyển hướng (Redirect) sang chuẩn Subdomain
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const remainingPath = '/' + pathParts.slice(1).join('/') + url.search;
        
        // Ví dụ: localhost:3000/coffee/admin?table=7 -> http://coffee.localhost:3000/admin?table=7
        return NextResponse.redirect(`${protocol}://${potentialTenant}.${rootDomain}${remainingPath}`);
      }
    }
    
    // Nếu là trang chủ (/) hoặc các trang public hợp lệ thì cho qua
    return NextResponse.next();
  }

  // Trích xuất Tenant ID từ subdomain (VD: 'game1.localhost:3000' -> 'game1')
  const tenantId = hostname.replace(`.${rootDomain}`, '');

  // Rewrite URL tĩnh dưới nền, giấu [tenantId] khỏi thanh địa chỉ người dùng
  // Ví dụ: người dùng thấy 'game1.localhost:3000/products', nhưng Next.js sẽ render route '/[tenantId]/products'
  url.pathname = `/${tenantId}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}

// Cấu hình matcher để middleware không chạy với các file tĩnh không cần thiết
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
