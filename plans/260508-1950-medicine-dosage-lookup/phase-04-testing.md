# Phase 04: Testing & Polish

Status: ⬜ Pending
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
- [ ] Thuốc không tồn tại trong database Gemini → hiện thông báo "Không tìm thấy"
- [ ] Gemini API rate limit (429) → key rotation tự xử lý, nếu tất cả key fail → hiện "Đang bận, vui lòng thử lại sau"
- [ ] Gemini API 503 → key rotation tự xử lý, transparent với user
- [ ] Network error → hiện "Lỗi kết nối" + nút Thử lại
- [ ] API key hết hạn / sai → log error server-side, rotation thử key khác, client hiện generic error nếu hết key
- [ ] Tên thuốc có ký tự đặc biệt → sanitize trước khi gửi
- [ ] Double-click nhanh → debounce, chỉ gọi API 1 lần
- [ ] Scroll page khi bubble đang mở → bubble theo anchor hoặc tự đóng

### 2. UX Polish
- [ ] Tooltip hint khi hover tên thuốc: "Click để tra cứu liều dùng"
- [ ] Loading skeleton animation mượt (pulse hoặc shimmer)
- [ ] Transition khi đóng mở bubble (không giật)
- [ ] Text selection trong bubble (cho phép copy kết quả)
- [ ] Mobile: kiểm tra trên viewport 375px (iPhone SE) và 414px (iPhone Plus)

### 3. Testing
- [ ] Unit test cho `useMedicineDosage` hook (mock fetch)
- [ ] Unit test cho `formatDosageText` utility
- [ ] Unit test cho API route `medicine-dosage/route.ts` (mock Gemini API)
- [ ] **Unit test cho key rotation**: mock 429 từ key1 → verify retry với key2
- [ ] **Unit test cho key rotation**: mock 503 từ key1 → verify retry với key2
- [ ] **Unit test cho all-keys-fail**: mock 429 từ tất cả keys → verify trả lỗi
- [ ] Component test cho SpeechBubble (render states)
- [ ] Integration test: click tên thuốc → hiện bubble → đóng bubble

### 4. Vercel Deploy Checklist
- [ ] Thêm `GEMINI_API_KEYS` (comma-separated) vào Vercel Environment Variables
- [ ] Verify API route hoạt động trên Vercel (serverless function)
- [ ] Verify key rotation hoạt động trên Vercel (test với nhiều key)
- [ ] Test CSP headers không block Gemini API calls
- [ ] Kiểm tra function timeout (Vercel free tier = 10s, cần đủ cho rotation + Gemini response)
- [ ] Monitor function logs trên Vercel dashboard (check key fail warnings)

### 5. Documentation
- [ ] Cập nhật README nếu cần (thêm GEMINI_API_KEY vào setup guide)
- [ ] Comment code cho các phần phức tạp (positioning logic, prompt template)

## Files to Create/Modify

| File | Action | Mục đích |
|------|--------|----------|
| `src/hooks/__tests__/useMedicineDosage.test.ts` | **Tạo mới** | Unit test hook |
| `src/lib/utils/__tests__/formatDosageText.test.ts` | **Tạo mới** | Unit test formatter |
| `src/app/api/medicine-dosage/__tests__/route.test.ts` | **Tạo mới** | Unit test API route |
| `src/components/ui/__tests__/SpeechBubble.test.tsx` | **Tạo mới** | Component test |

## Test Criteria

- [ ] Tất cả unit tests pass
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
