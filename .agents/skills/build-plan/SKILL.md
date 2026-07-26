---
name: build-plan
description: Quy trình Phát triển phần mềm khép kín kết hợp đa tác vụ cho BizSaaS (2 Core-Coder, Code Review, và QA Testing).
---

# Kỹ Năng: Quy Trình Phát Triển Khép Kín (Master Pipeline)

Kỹ năng này đóng vai trò là "Nhạc trưởng" (Orchestrator). Khi Main Agent nhận yêu cầu phát triển một tính năng mới hoặc một Module hoàn chỉnh, bạn PHẢI tuân thủ nghiêm ngặt quy trình dây chuyền 4 bước sau:

## Giai đoạn 1: Lập trình song song (Parallel Coding)
- Để đảm bảo chất lượng và tốc độ, điều phối tối đa **2 Sub-agent `Core-Coder`** làm việc cùng lúc.
  - *Ví dụ:* Coder A chuyên lo Frontend/UI Component (Next.js/Antd); Coder B chuyên viết Backend API/Logic (NestJS/TypeORM).
- **Merge Code & Đối chiếu:** Sau khi 2 Coder hoàn thành, Main Agent KHÔNG được tin tưởng 100%. Bạn phải đọc lại mã nguồn, kiểm tra độ tương thích (đặc biệt về phân quyền dữ liệu Tenant), trực tiếp sửa lỗi xung đột nếu có, và cam kết rằng code được ghép lại hoạt động đúng với cấu trúc dự án.

## Giai đoạn 2: Lưới lọc 1 - Code Review
- Sau khi hợp nhất thành công, kích hoạt kỹ năng **workflow-code-review**.
- Chạy vòng lặp Auto-Fix với `Code-Reviewer` để dọn sạch lỗi cú pháp, bảo mật (chống Data Leakage giữa các Tenant) và Convention.

## Giai đoạn 3: Lưới lọc 2 - QA Testing
- Sau khi lưới lọc 1 báo PASS, tiếp tục kích hoạt kỹ năng **workflow-qa-review**.
- Chạy vòng lặp Auto-Test với `QA-Tester` để đảm bảo logic nghiệp vụ chạy đúng thực tế (tạo Database mới thành công, Subdomain load đúng giao diện).

## Giai đoạn 4: Tổng hợp & Quyết định (Human-in-the-loop)
- Sau khi qua cả 2 Lưới lọc khắt khe, nếu vẫn còn tồn đọng lỗi (do vượt quá giới hạn 3 lần lặp, lỗi quá phức tạp, hoặc hệ thống cần biến môi trường), Main Agent **DỪNG LẠI**.
- Lập một **Danh sách các lỗi còn sót lại (Known Issues)** cực kỳ rõ ràng.
- Báo cáo với User: *"Dưới đây là danh sách lỗi còn sót lại sau quy trình 2 bước test. Anh kiểm duyệt qua xem có nên fix luôn hay không?"*
