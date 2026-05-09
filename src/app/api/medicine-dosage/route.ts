import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { medicineName } = await req.json();

    if (!medicineName || typeof medicineName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Tên thuốc không hợp lệ' },
        { status: 400 }
      );
    }

    if (medicineName.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Tên thuốc quá dài (tối đa 200 ký tự)' },
        { status: 400 }
      );
    }

    const apiKeysString = process.env.GEMINI_API_KEYS || '';
    const keys = apiKeysString
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k !== '');

    if (keys.length === 0) {
      console.error('GEMINI_API_KEYS is not configured');
      return NextResponse.json(
        { success: false, error: 'Dịch vụ chưa được cấu hình API key' },
        { status: 500 }
      );
    }

    const prompt = `Bạn là dược sĩ chuyên nghiệp. Hãy sử dụng công cụ tìm kiếm Google để tra cứu thông tin chính xác và cập nhật nhất về liều dùng của thuốc "${medicineName}". 
Trả lời bằng tiếng Việt theo format sau:

**Liều dùng ${medicineName} theo độ tuổi**

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

Lưu ý: 
- Luôn ưu tiên thông tin từ các nguồn uy tín như Dược thư quốc gia, Medscape, hoặc các trang y tế chính thống.
- Nếu thuốc có nhiều biệt dược hoặc hàm lượng khác nhau, hãy nêu rõ.
- Chỉ cung cấp thông tin tham khảo. Nếu không tìm thấy thuốc dù đã tìm kiếm online, hãy nói rõ.`;

    // Shuffle start index for load balancing and fair key usage
    const startIndex = Math.floor(Math.random() * keys.length);

    // Iterate through all keys starting from a random index until one succeeds
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[(startIndex + i) % keys.length];
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${currentKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              tools: [
                {
                  google_search: {}
                }
              ]
            }),
            signal: AbortSignal.timeout(20000), // Tăng timeout lên 20s vì tìm kiếm online có thể lâu hơn
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          const dosageInfo = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!dosageInfo) {
            throw new Error('Không nhận được nội dung từ Gemini');
          }

          return NextResponse.json({
            success: true,
            data: {
              medicineName,
              dosageInfo,
            },
          });
        }

        if (response.status === 429) {
          console.warn(`Key ${(startIndex + i) % keys.length + 1} bị rate limit (429), đang thử key tiếp theo...`);
          continue;
        }

        if (response.status === 503) {
          console.warn(`Key ${(startIndex + i) % keys.length + 1} bị service unavailable (503), đang thử key tiếp theo...`);
          continue;
        }

        if (response.status >= 400 && response.status < 500) {
          const errorData = await response.json();
          console.error(`Key ${(startIndex + i) % keys.length + 1} lỗi ${response.status}:`, errorData);
          continue;
        }

        // For 500 errors or others, we stop and report
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);

      } catch (err: any) {
        if (err.name === 'TimeoutError') {
          console.warn(`Key ${(startIndex + i) % keys.length + 1} bị timeout, đang thử key tiếp theo...`);
          continue;
        }
        console.error(`Lỗi khi gọi Gemini API với key ${(startIndex + i) % keys.length + 1}:`, err.message);
        // If it's the last key, the loop will end and we return error
      }
    }

    return NextResponse.json(
      { success: false, error: 'Tất cả API key đều thất bại hoặc bị giới hạn lượt dùng' },
      { status: 503 }
    );

  } catch (error: any) {
    console.error('Medicine dosage API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
