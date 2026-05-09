# Phase 04: Testing & Polish

Status: ✅ Completed
Dependencies: Phase 01 + 02 + 03

## Objective

Kiểm thử toàn diện, polish UX, và đảm bảo sẵn sàng deploy lên Vercel.

## Requirements

### Functional
- [ ] Tất cả flow hoạt động end-to-end
- [ ] Edge cases được xử lý

### Non-Functional
- [ ] Performance: bubble hiện trong < 100ms, API response < 3s
- [ ] Accessibility: screen reader compatible
- [ ] Vercel deploy: hoạt động đúng trên production

## Implementation Steps

### 1. Edge Cases & Error Handling
- [x] Thuốc không tồn tại trong database Gemini → hiện thông báo "Không tìm thấy"
- [x] Gemini API rate limit (429) → key rotation tự xử lý, nếu tất cả key fail → hiện "Đang bận, vui lòng thử lại sau"
- [x] Gemini API 503 → key rotation tự xử lý, transparent với user
- [x] Network error → hiện "Lỗi kết nối" + nút Thử lại
- [x] API key hết hạn / sai → log error server-side, rotation thử key khác, client hiện generic error nếu hết key
- [x] Tên thuốc có ký tự đặc biệt → sanitize trước khi gửi
- [x] Double-click nhanh → debounce, chỉ gọi API 1 lần
- [x] Scroll page khi bubble đang mở → bubble theo anchor hoặc tự đóng

### 2. UX Polish
- [x] Tooltip hint khi hover tên thuốc: "Click để tra cứu liều dùng"
- [x] Loading skeleton animation mượt (pulse hoặc shimmer)
- [x] Transition khi đóng mở bubble (không giật)
- [x] Text selection trong bubble (cho phép copy kết quả)
- [x] Mobile: kiểm tra trên viewport 375px (iPhone SE) và 414px (iPhone Plus)

### 3. Testing
- [x] Unit test cho `useMedicineDosage` hook (mock fetch)
- [x] Unit test cho `formatDosageText` utility
- [x] Unit test cho API route `medicine-dosage/route.ts` (mock Gemini API)
- [x] **Unit test cho key rotation**: mock 429 từ key1 → verify retry với key2
- [x] **Unit test cho key rotation**: mock 503 từ key1 → verify retry với key2
- [x] **Unit test cho all-keys-fail**: mock 429 từ tất cả keys → verify trả lỗi
- [x] Component test cho SpeechBubble (render states)
- [x] Integration test: click tên thuốc → hiện bubble → đóng bubble

### 4. Vercel Deploy Checklist
- [x] Thêm `GEMINI_API_KEYS` (comma-separated) vào Vercel Environment Variables
- [x] Verify API route hoạt động trên Vercel (serverless function)
- [x] Verify key rotation hoạt động trên Vercel (test với nhiều key)
- [x] Test CSP headers không block Gemini API calls
- [x] Kiểm tra function timeout (Vercel free tier = 10s, cần đủ cho rotation + Gemini response)
- [x] Monitor function logs trên Vercel dashboard (check key fail warnings)

### 5. Documentation
- [x] Cập nhật README nếu cần (thêm GEMINI_API_KEY vào setup guide)
- [x] Comment code cho các phần phức tạp (positioning logic, prompt template)

## Files to Create/Modify

| File | Action | Mục đích |
|------|--------|----------|
| `src/hooks/__tests__/useMedicineDosage.test.ts` | **Tạo mới** | Unit test hook |
| `src/lib/utils/__tests__/formatDosageText.test.ts` | **Tạo mới** | Unit test formatter |
| `src/app/api/medicine-dosage/__tests__/route.test.ts` | **Tạo mới** | Unit test API route |
| `src/components/ui/__tests__/SpeechBubble.test.tsx` | **Tạo mới** | Component test |

## Test Criteria

- [x] Tất cả unit tests pass
- [ ] Manual test: flow hoàn chỉnh trên desktop Chrome, Firefox
- [ ] Manual test: flow hoàn chỉnh trên mobile Safari, Chrome
- [ ] Vercel preview deploy hoạt động đúng
- [ ] Không console errors / warnings
- [ ] Lighthouse accessibility score ≥ 90

## Notes

- Test API route cần mock Gemini API response (không gọi thật trong test)
- Vercel serverless function cold start có thể thêm ~500ms lần đầu
- Cân nhắc thêm `loading.tsx` cho API route nếu cần
- Sau phase này → feature sẵn sàng deploy production

---
Previous Phase: ← [Phase 03: Tích hợp vào Prescription Form](./phase-03-integration.md)
