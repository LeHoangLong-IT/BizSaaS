---
name: ai-gemini
description: Hướng dẫn tích hợp AI (Gemini API) cho các tính năng sinh nội dung và phân tích trong BizSaaS.
---

# Kỹ Năng: AI Integration (Gemini API)

## 1. Tích hợp AI vào SaaS
- Dùng Google Gemini API để hỗ trợ Tenant tạo nhanh nội dung (vd: Tự động viết mô tả sản phẩm Sách, Tài khoản Game, hay Cà phê dựa trên vài từ khóa).
- Đảm bảo gọi API thông qua Backend (NestJS), không gọi trực tiếp từ Frontend để bảo mật API Key.

## 2. Prompt Engineering
- Prompt cần chỉ định rõ ngữ cảnh (vd: "Viết mô tả hấp dẫn cho một tài khoản game Liên Quân rank Cao Thủ").
- Khi trả về data có cấu trúc, yêu cầu format JSON chuẩn xác.

## 3. Quản lý Hiệu năng
- Cache lại các kết quả AI đã sinh ra (nếu cần thiết) để tiết kiệm quota.
