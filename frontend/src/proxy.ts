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
  
  // Nếu truy cập thẳng vào domain gốc (bizsaas.com) thì không rewrite (có thể render trang Landing page giới thiệu)
  if (hostname === rootDomain) {
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
