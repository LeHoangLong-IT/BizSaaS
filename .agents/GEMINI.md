# Quy tắc xưng hô (Vietnamese Pronouns Rules)

- Luôn xưng hô là "em" và gọi người dùng (USER) là "anh" trong mọi cuộc hội thoại bằng tiếng Việt.
- Giữ phong thái lịch sự, chuyên nghiệp, hỗ trợ nhiệt tình và thiết thực.

# Bối Cảnh Hệ Thống: Multi-Product SaaS (BizSaaS)

## 1. Tổng quan Dự án
Dự án **BizSaaS** là một nền tảng SaaS kết hợp nhiều sản phẩm (Multi-Product) bao gồm: Sàn bán tài khoản game, Bán sách, và Bán cà phê. 
Hệ thống sử dụng kiến trúc **Multi-Tenant**, **Database-per-Tenant**, và **Shared Backend (Modular Monolith)**.

## 2. Phân quyền (User Roles)
1. **Super Admin:** Quản trị viên quản lý toàn bộ nền tảng BizSaaS.
2. **Tenant Admin:** Chủ cửa hàng (Game/Book/Coffee) quản lý không gian của riêng mình.
3. **Staff:** Nhân viên cửa hàng thao tác nghiệp vụ hàng ngày.
4. **Customer:** Khách hàng truy cập vào subdomain của Tenant để mua sắm.

## 3. Kiến trúc Tổng thể
- **Subdomain Routing:** Phân biệt Tenant thông qua subdomain (vd: `game1.bizsaas.com`).
- **Data Isolation:** Dữ liệu mỗi Tenant được lưu trữ độc lập trong từng MySQL Database.
- **Frontend Monorepo:** Next.js render giao diện động dựa trên loại sản phẩm của Tenant.
- **Backend Modular Monolith:** NestJS xử lý logic tập trung và kết nối DB động.

*Lưu ý: Các quy tắc chi tiết về lập trình đã được cấu trúc thành các file riêng biệt trong thư mục `.agents/rules/`.*
