---
name: workflow-code-review
description: Quy trình tự động hóa kiểm tra và sửa code (Auto-Fix Loop) sử dụng sub-agent Code-Reviewer cho dự án BizSaaS.
---

# Kỹ Năng: Quy trình Code Review Tự động (Auto-Fix Loop)

Kỹ năng này định nghĩa luồng làm việc (workflow) phối hợp nhịp nhàng giữa Main Agent (Bạn) và Sub-agent (Code-Reviewer) để đảm bảo chất lượng code đạt chuẩn trước khi kết thúc tác vụ.

## Quy trình Thực thi (The Review Loop)

Ngay khi bạn (Main Agent) vừa hoàn thành việc viết hoặc cập nhật bất kỳ một file code quan trọng nào, bạn PHẢI thực hiện quy trình sau:

### Bước 1: Gọi Sub-agent (Invoke Code-Reviewer)
- Bạn tổng hợp file code (hoặc đoạn code) vừa viết, gửi cho sub-agent `Code-Reviewer`.
- Yêu cầu rõ: *"Hãy kiểm tra đoạn code này dựa trên các tiêu chuẩn Next.js/NestJS của BizSaaS, đặc biệt lưu ý kiểm tra vấn đề rò rỉ dữ liệu (Data Leakage) giữa các Tenant. Trả về danh sách lỗi và phương án sửa. Nếu không có lỗi, trả về 'PASS'."*

### Bước 2: Phân tích Phản hồi (Analyze Feedback)
- Đợi kết quả từ Code-Reviewer.
- **Thành công:** Nếu Code-Reviewer trả về 'PASS' (Không có lỗi). Vòng lặp kết thúc.
- **Có lỗi:** Nếu Code-Reviewer trả về danh sách lỗi, sang Bước 3.

### Bước 3: Tự động Sửa Lỗi (Auto-Fix)
- Main Agent phải phân tích kỹ các lỗi (Bug, Security, Convention) mà Code-Reviewer đã phát hiện.
- Trực tiếp tiến hành chỉnh sửa file code để khắc phục hoàn toàn.

### Bước 4: Kiểm tra lại (Re-check)
- Quay lại **Bước 1**. Gửi lại code *đã sửa* cho Code-Reviewer đánh giá lần 2.
- Lặp lại quá trình này (Fix -> Review) cho đến khi Code-Reviewer báo PASS.

## Ràng buộc
- Nếu lặp quá 3 lần mà vẫn còn lỗi, ngưng lặp, ghi nhận danh sách lỗi và báo cho User.
