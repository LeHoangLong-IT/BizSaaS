---
name: frontend-nextjs
description: Kỹ năng và Quy chuẩn viết code Frontend sử dụng Next.js, Tailwind CSS và Ant Design cho BizSaaS (Multi-Tenant).
---

# Kỹ Năng: Frontend Next.js + Tailwind + Antd Guidelines

## 1. Kiến trúc Next.js (App Router)
- Bắt buộc sử dụng cấu trúc **App Router** (thư mục `app/`) của Next.js >= 13.
- Xử lý Tenant: Dùng Next.js Middleware để đọc Subdomain và inject `tenantId` / `productType` xuống các component.
- Ưu tiên Server Components để tối ưu SEO và tốc độ.
- Rendering theo Module: Giao diện linh hoạt dựa vào `productType` (Game, Book, Coffee). Thư mục module đặt tại `@/modules/game`, v.v.

## 2. Giao diện (UI/UX)
- Sử dụng **Tailwind CSS** kết hợp **Ant Design (antd)**.
- **Dynamic Theming:** Sử dụng `ConfigProvider` của Antd để đổi theme theo loại cửa hàng (Dark mode cho Game, Sáng/Ấm áp cho Sách/Cafe).
- Hạn chế 'use client' ở những nơi không cần thiết.

## 3. Quản lý State & API
- Dùng `SWR` hoặc `React Query` kết hợp với `axios` để gọi API từ NestJS Backend.
- Luôn gửi kèm context (header `x-tenant-id` hoặc thông qua subdomain API URL) để Backend nhận diện.
