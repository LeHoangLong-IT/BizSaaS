---
name: backend-nestjs
description: Kỹ năng và Quy chuẩn viết code Backend sử dụng NestJS, TypeORM và MySQL cho BizSaaS (Modular Monolith).
---

# Kỹ Năng: Backend NestJS + MySQL Guidelines

## 1. Kiến trúc NestJS (Modular Monolith)
- Phân chia Module rõ ràng: `CoreModule`, `TenantModule`, `GameModule`, `BookModule`, `CoffeeModule`.
- Áp dụng Dependency Injection một cách cẩn thận, đặc biệt dùng scope `REQUEST` khi inject Database Connection cho từng Tenant.
- Tách biệt rõ Controller, Service, Repository.

## 2. Database & TypeORM
- Sử dụng **MySQL** làm cơ sở dữ liệu.
- Quản lý Database-per-Tenant: Backend phải tự động khởi tạo database mới (CREATE DATABASE) khi có Tenant đăng ký.
- Kết nối động: `TypeORM` sẽ nhận kết nối dựa vào `tenantId` từ Request object (thông qua Middleware).
- **Tuyệt đối không query nhầm DB của tenant khác** (chống Data Leakage).

## 3. Bảo mật & Xử lý lỗi
- Áp dụng Authentication bằng **JWT**, phân quyền rõ ràng (Super Admin, Tenant Admin, Staff, Customer).
- Sử dụng Global Exception Filter để trả lỗi JSON thống nhất.
