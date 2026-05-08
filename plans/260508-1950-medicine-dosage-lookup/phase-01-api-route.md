# Phase 01: Backend API Route - Gemini Dosage Lookup

Status: ⬜ Pending
Dependencies: Không

## Objective

Tạo Next.js API Route gọi Gemini `models/gemini-2.5-flash-lite` để tra cứu liều dùng thuốc. **Hỗ trợ nhiều API key với thuật toán xoay tua tự động** khi gặp lỗi 429/503. API key được bảo mật server-side, client chỉ gửi tên thuốc.

## Requirements

### Functional
- [ ] API nhận `medicineName` (string) và trả về thông tin liều dùng
- [ ] Response có cấu trúc rõ ràng: tiêu đề thuốc, liều người lớn, liều trẻ em theo nhóm tuổi, cách dùng, mô tả thuốc
- [ ] Prompt Gemini được thiết kế để trả kết quả tiếng Việt, format nhất quán
- [ ] Xử lý lỗi: API key thiếu, Gemini API lỗi, rate limit, timeout
- [ ] **Xoay tua API key:** Khi gặp lỗi 429 (rate limit) hoặc 503 (service unavailable) → tự động chuyển sang API key tiếp theo
- [ ] Retry với key khác tối đa = số lượng key có sẵn (thử hết tất cả key mới báo lỗi)

### Non-Functional
- [ ] Nhiều API key lưu trong env variable `GEMINI_API_KEYS` (dạng comma-separated, server-side only)
- [ ] Timeout: 15s cho mỗi lần gọi Gemini API
- [ ] Response time target: < 3s (Gemini Flash Lite rất nhanh)
- [ ] Thuật toán xoay tua key phải stateless (không cần database/cache giữa các request)

## Implementation Steps

### 1. Cấu hình Environment Variable (Multi-Key)
- [ ] Thêm `GEMINI_API_KEYS` vào `.env.local` (nhiều key, phân cách bằng dấu phẩy)
- [ ] Thêm `GEMINI_API_KEYS` vào `.env.example` (không có giá trị)
- [ ] Thêm `GEMINI_API_KEYS` vào Vercel Environment Variables (Production + Preview)

**Files:**
- `.env.local` - Thêm dòng `GEMINI_API_KEYS=key1,key2,key3`
- `.env.example` - Thêm dòng `GEMINI_API_KEYS=`

**Lưu ý:** Hỗ trợ 1 key hoặc nhiều key. Nếu chỉ có 1 key thì không cần dấu phẩy.

### 2. Tạo API Route + Thuật toán xoay tua key
- [ ] Tạo file `src/app/api/medicine-dosage/route.ts`
- [ ] Implement POST handler nhận `{ medicineName: string }`
- [ ] Validate input (medicineName không rỗng, max 200 ký tự)
- [ ] **Implement key rotation logic** (chi tiết bên dưới)
- [ ] Parse response và trả về structured JSON

**Gemini API Call chi tiết:**
```
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={API_KEY}
Method: POST
Headers: Content-Type: application/json
Body: {
  "contents": [{
    "parts": [{ "text": "<prompt>" }]
  }]
}
```

**🔄 Thuật toán xoay tua API Key:**

```
Input: GEMINI_API_KEYS = "key1,key2,key3"

1. Parse keys = GEMINI_API_KEYS.split(',').map(k => k.trim())
2. startIndex = random(0, keys.length - 1)   // bắt đầu ngẫu nhiên, phân tải đều
3. for (i = 0; i < keys.length; i++):
     currentKey = keys[(startIndex + i) % keys.length]
     response = callGemini(currentKey, prompt)
     
     if response.status === 200:
       return response.data           // ✅ Thành công
     
     if response.status === 429:       // Rate limit
       console.warn(`Key ${i+1} bị rate limit, thử key tiếp...`)
       continue                        // → Thử key tiếp theo
     
     if response.status === 503:       // Service unavailable  
       console.warn(`Key ${i+1} bị 503, thử key tiếp...`)
       continue                        // → Thử key tiếp theo
     
     if response.status === 400/401/403:  // Key lỗi vĩnh viễn
       console.error(`Key ${i+1} lỗi ${response.status}`)
       continue                        // → Thử key tiếp theo
     
     // Lỗi khác (500, network...)
     break                             // Không retry, báo lỗi ngay

4. return { error: "Tất cả API key đều thất bại" }  // Đã thử hết
```

**Tại sao dùng random startIndex?**
- Nếu luôn bắt đầu từ key1 → key1 chịu tải nhiều nhất, nhanh hết quota
- Random startIndex → phân tải đều giữa các key
- Stateless: không cần lưu state giữa các request (phù hợp serverless)

### 3. Thiết kế Prompt
- [ ] Prompt yêu cầu Gemini trả kết quả tiếng Việt
- [ ] Format output nhất quán theo template:

```
Prompt template:
"Bạn là dược sĩ chuyên nghiệp. Hãy tra cứu liều dùng của thuốc "{medicineName}" và trả lời bằng tiếng Việt theo format sau:

**Liều dùng {medicineName} theo độ tuổi**

**Người lớn:**
[Liều dùng cụ thể]

**Trẻ em [nhóm tuổi 1]:**
[Liều dùng cụ thể]

**Trẻ em [nhóm tuổi 2]:**
[Liều dùng cụ thể]

**Cách dùng**
[Hướng dẫn cách dùng]

**Thông tin thuốc:**
[Mô tả ngắn về thành phần và công dụng]

Lưu ý: Chỉ cung cấp thông tin tham khảo. Nếu không tìm thấy thuốc, hãy nói rõ."
```

### 4. Response Format
- [ ] API trả về JSON:
```json
{
  "success": true,
  "data": {
    "medicineName": "Atersin",
    "dosageInfo": "**Liều dùng Atersin theo độ tuổi**\n\n**Người lớn:**\n..."
  }
}
```
- [ ] Lỗi trả về:
```json
{
  "success": false,
  "error": "Mô tả lỗi"
}
```

### 5. Cập nhật CSP (Content Security Policy)
- [ ] Cập nhật `next.config.ts` để cho phép kết nối đến `generativelanguage.googleapis.com`
- [ ] Thêm `connect-src 'self' https://generativelanguage.googleapis.com` vào CSP header

**File:** `next.config.ts` - Sửa CSP header

## Files to Create/Modify

| File | Action | Mục đích |
|------|--------|----------|
| `src/app/api/medicine-dosage/route.ts` | **Tạo mới** | API Route + key rotation logic |
| `.env.local` | Sửa | Thêm GEMINI_API_KEYS (comma-separated) |
| `.env.example` | Sửa | Thêm GEMINI_API_KEYS template |
| `next.config.ts` | Sửa | Cập nhật CSP cho Gemini API domain |

## Test Criteria

- [ ] `POST /api/medicine-dosage` với `{ "medicineName": "Atersin" }` → trả kết quả liều dùng
- [ ] `POST /api/medicine-dosage` với body rỗng → trả lỗi 400
- [ ] `POST /api/medicine-dosage` không có API key → trả lỗi 500 rõ ràng
- [ ] Response format đúng cấu trúc JSON
- [ ] API key KHÔNG xuất hiện trong browser network tab
- [ ] **Key rotation:** Khi key1 trả 429 → tự động thử key2 → trả kết quả thành công
- [ ] **Key rotation:** Khi key1 trả 503 → tự động thử key2 → trả kết quả thành công
- [ ] **All keys fail:** Khi tất cả key đều 429 → trả lỗi rõ ràng cho client
- [ ] **Single key mode:** Chỉ 1 key trong env → vẫn hoạt động bình thường

## Notes

- Gemini Flash Lite rất nhanh (~1-2s response), phù hợp cho popup
- API Route chạy trên Vercel Serverless Function, timeout mặc định 10s (free tier)
- Không cần install thêm package, dùng native `fetch` gọi REST API
- CSP `connect-src` chỉ cần cho browser-side fetch; API route server-side không bị ảnh hưởng, nhưng vẫn nên thêm để an toàn nếu sau này cần gọi trực tiếp từ client
- **Key rotation là stateless** → mỗi request tự chọn key ngẫu nhiên, không cần shared state giữa serverless instances
- Worst case (tất cả key fail): response time = N × timeout (N = số key). Nên giới hạn timeout mỗi lần gọi ~5s để tổng không quá 10s Vercel limit
- Log server-side khi key fail để monitor key nào cần thay thế

---
Next Phase: → [Phase 02: Speech Bubble Component](./phase-02-speech-bubble.md)
