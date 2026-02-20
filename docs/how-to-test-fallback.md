# Hướng dẫn kiểm tra Fallback Architecture

Để kiểm chứng việc AI hiểu và tuân thủ cấu trúc Fallback (ưu tiên rule nội bộ của dự án trước, dự phòng bằng rule của OS), bạn có thể làm theo kịch bản test sau:

## 🧪 Kịch bản Test

### Bước 1: Setup môi trường Test
1. Tạo một thư mục dự án mới hoàn toàn (ví dụ: `my-test-project`).
2. Copy các file cốt lõi của `ai-context-os` vào thư mục này (`PROJECT_OS.md`, `.cursorrules`, `CLAUDE.md`, và folder `skills`).

### Bước 2: Khai báo Custom Rule (Priority 1)
Trong thư mục `my-test-project`, tạo một file rule nội bộ nhằm ghi đè lên chuẩn của OS. Bạn có thể tạo file `skills/custom-rule.md`:

```markdown
# My Custom Override
> Yêu cầu bắt buộc: Khi viết code Python, KHÔNG BAO GIỜ dùng thư viện `requests`, chỉ được phép dùng `httpx`.
> Đây là rule nội bộ của dự án, ưu tiên cao hơn mọi rule mặc định khác.
```
Cập nhật file `.cursorrules` hoặc `CLAUDE.md` trong dự án `my-test-project` nhằm đảm bảo Agent sẽ luôn đọc folder `skills/` (kể cả file custom mà bạn vừa thêm).

### Bước 3: Đưa yêu cầu cho AI
Mở dự án `my-test-project` bằng AI Agent của bạn. Nhập prompt sau:

> "Hãy viết một script Python nhỏ để tải dữ liệu REST API từ https://jsonplaceholder.typicode.com/posts/1"

### Bước 4: Kiểm tra kết quả (Expected Outcome)
- **Nếu AI dùng `httpx`**: Bài test **THÀNH CÔNG**. Điều này chứng tỏ AI đã tuân thủ file `custom-rule.md` (Priority 1) của bạn để ghi đè các thói quen mặc định.
- **Nếu AI dùng `requests` hoặc thư viện khác**: Bài test **THẤT BẠI**. AI chưa hiểu cấu trúc ưu tiên hoặc file config chưa link đúng các file custom.

## 💡 Giải thích cơ chế
Trong `PROJECT_OS.md` (Priority 2) không hề cấm dùng `requests`. Nhưng vì dự án của bạn có file `custom-rule.md` (Priority 1) cấm điều đó, quy tắc Fallback đã diễn ra: AI tuân thủ Custom Rule trước. Nếu bạn xóa file `custom-rule.md` đi, AI sẽ lại dùng `requests` bình thường như hành vi mặc định.
