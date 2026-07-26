---
name: database
description: Quy tắc Cơ sở dữ liệu (MySQL & TypeORM) xử lý mô hình Database-per-Tenant cho BizSaaS.
---

# Quy tắc Cơ sở dữ liệu (MySQL & TypeORM)

## 1. Cấu trúc Database
- **Master Database (`bizsaas_master`):** Lưu trữ thông tin chung như danh sách Tenants, Subdomains, Product Types, Subscription Plans.
- **Tenant Databases (`tenant_xxx_db`):** Mỗi Tenant có 1 DB riêng rẽ chứa dữ liệu nghiệp vụ của cửa hàng đó.

## 2. Tự động hóa (Automation)
- Quá trình đăng ký Tenant mới sẽ kích hoạt tạo DB tự động (`CREATE DATABASE`).
- Hệ thống tự động chạy Migrations (tạo bảng, seed dữ liệu cơ bản) trên DB mới tạo của Tenant.

## 3. Quy tắc Truy vấn
- KHÔNG BAO GIỜ query trực tiếp dữ liệu nghiệp vụ trên Master Database.
- Đảm bảo kết nối đúng Tenant DB. Chống rò rỉ dữ liệu (Data Leakage) giữa các Tenants.
- Tối ưu hóa Connection Pool cho môi trường Multi-Tenant.
