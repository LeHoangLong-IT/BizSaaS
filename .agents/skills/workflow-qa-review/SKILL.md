---
name: workflow-qa-review
description: Quy trình tự động hóa kiểm thử nghiệp vụ (QA Auto-Test Loop) sử dụng sub-agent QA-Tester cho BizSaaS.
---

# Kỹ Năng: Quy trình QA Testing Tự động

Kỹ năng này định nghĩa luồng làm việc giữa Main Agent (Bạn) và Sub-agent (QA-Tester) để kiểm tra logic nghiệp vụ của hệ thống BizSaaS.

## Quy trình Thực thi (The Test Loop)

### Bước 1: Gọi Sub-agent (Invoke QA-Tester)
- Bạn tổng hợp file code Logic/Flow vừa viết, gửi cho sub-agent `QA-Tester`.
- Yêu cầu rõ: *"Hãy tạo kịch bản kiểm thử (Test cases) và phân tích luồng code này xem có pass được các kịch bản thực tế (đặc biệt là logic cấp phát Database-per-tenant, Subdomain routing). Nếu lỗi, chỉ rõ. Nếu mọi thứ hoàn hảo, trả về 'PASS'."*

### Bước 2: Phân tích Phản hồi
- **Thành công:** Nếu QA-Tester trả về 'PASS'. Vòng lặp kết thúc.
- **Có lỗi/Hổng logic:** Sang Bước 3.

### Bước 3: Tự động Sửa Lỗi Logic (Auto-Fix Logic)
- Main Agent phân tích những lỗ hổng logic do QA-Tester phát hiện.
- Sửa lại code cho đúng chuẩn, đảm bảo dữ liệu chạy đúng Tenant DB tương ứng.

### Bước 4: Kiểm tra lại (Re-check)
- Quay lại **Bước 1** để QA-Tester verify lại luồng dữ liệu mới. Lặp lại cho đến khi PASS.

## Ràng buộc
- Tuyệt đối không bỏ qua các lỗi liên quan đến Data Isolation và bảo mật dữ liệu khách hàng (Tenant).
- Nếu lặp quá 3 lần mà QA-Tester vẫn báo failed, ngưng vòng lặp, lập danh sách ghi chú lại báo cáo User.
