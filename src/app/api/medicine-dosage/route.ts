import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { medicineDosageSchema, medicineDosageOutputSchema } from '@/lib/validations/medicine';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    let supabase;
    try {
      const authResult = await getAuthUser();
      supabase = authResult.supabase;
    } catch (authError) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = medicineDosageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const { medicineName } = validation.data;

    const normalizedQuery = medicineName.trim().toLowerCase();

    // 2. Query cache (TTL: 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from('medicine_dosage_cache')
      .select('*')
      .eq('medicine_name_query', normalizedQuery)
      .gt('created_at', sevenDaysAgo)
      .single();

    if (cached) {
      return NextResponse.json({
        success: true,
        data: {
          medicine_name: cached.medicine_name,
          adult_dosage: cached.adult_dosage,
          children_dosage: cached.children_dosage,
          usage_instructions: cached.usage_instructions,
          description: cached.description,
          contraindications: cached.contraindications,
          side_effects: cached.side_effects
        }
      });
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

    const modelName = 'gemini-2.5-flash-lite';

    // --- STEP 1: Search for medicine information ---
    const searchSystemPrompt = `Bạn là một dược sĩ lâm sàng (Clinical Pharmacist) chuyên về nhi khoa. 
Nhiệm vụ: Tra cứu thông tin liều dùng chính xác và an toàn nhất cho thuốc được yêu cầu.

Yêu cầu tra cứu:
1. Luôn tìm kiếm liều lượng theo cân nặng (mg/kg) và theo tuổi cho nhi khoa.
2. Chia nhỏ liều theo các mốc tuổi cụ thể:
   - Trẻ sơ sinh (Neonates)
   - Trẻ nhỏ (Dưới 1 tuổi)
   - Trẻ từ 1-3 tuổi
   - Trẻ từ 3-6 tuổi
   - Trẻ từ 6-12 tuổi
   - Thanh thiếu niên (> 12 tuổi)
3. Tìm kiếm thông tin về hàm lượng phổ biến và cách dùng (uống, tiêm, v.v.).
4. Nguồn tin: Ưu tiên Dược thư Quốc gia Việt Nam, Medscape, hoặc BNF for Children.
5. Trình bày chi tiết thông tin tìm được, ưu tiên các dữ liệu nhi khoa.`;

    const searchUserPrompt = `Hãy tra cứu thông tin chi tiết về liều dùng cho thuốc: ${medicineName}`;

    let searchResult = '';
    const startIndex = Math.floor(Math.random() * keys.length);

    // Try Step 1
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[(startIndex + i) % keys.length];
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${currentKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: searchSystemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: searchUserPrompt }] }],
              tools: [{ google_search: {} }]
            }),
            signal: AbortSignal.timeout(30000),
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          searchResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (searchResult) break;
        }
        
        if ([429, 503].includes(response.status)) continue;
        if (response.status >= 400) {
          const errorData = await response.json();
          console.warn(`Step 1 - Key ${i+1} error ${response.status}:`, errorData);
          continue;
        }
      } catch (err) {
        console.warn(`Step 1 - Key ${i+1} failed:`, err);
        continue;
      }
    }

    if (!searchResult) {
      return NextResponse.json(
        { success: false, error: 'Không thể tìm kiếm thông tin thuốc sau nhiều lần thử' },
        { status: 503 }
      );
    }

    // --- STEP 2: Format information as JSON ---
    const formatSystemPrompt = `Bạn là một chuyên gia cấu trúc dữ liệu y tế. 
Nhiệm vụ: Trích xuất thông tin thuốc từ văn bản tra cứu và định dạng thành JSON.

Quy tắc định dạng văn bản trong các trường (adult_dosage, children_dosage, usage_instructions, v.v.):
- Dùng dấu "-" cho các mục lớn hoặc nhóm tuổi.
- Dùng dấu "+" cho chi tiết liều hoặc lưu ý nhỏ.
- LUÔN LUÔN chèn ký tự xuống dòng "\\n" giữa các dòng để đảm bảo giao diện hiển thị đúng.
- Không tự ý thêm thông tin không có trong văn bản gốc.

Chỉ trả về duy nhất JSON, không giải thích.`;

    const formatUserPrompt = `Dựa vào thông tin tra cứu dưới đây, hãy trích xuất và định dạng thành JSON:
---
${searchResult}
---

Ví dụ định dạng (Few-shot):
{
  "medicine_name": "Hapacol 150",
  "children_dosage": "- Trẻ em từ 1-3 tuổi:\\n  + Liều dùng: 10-15mg/kg/lần.\\n  + Tối đa 4 lần/ngày.\\n- Trẻ em từ 4-6 tuổi:\\n  + Liều dùng: 1 gói/lần.",
  ...
}

Yêu cầu JSON phải có đủ 7 trường sau:
1. medicine_name: Tên thuốc
2. adult_dosage: Liều người lớn (định dạng -, + và \\n)
3. children_dosage: Liều trẻ em (chia theo nhóm tuổi, định dạng -, + và \\n)
4. usage_instructions: Cách dùng
5. description: Mô tả thêm
6. contraindications: Chống chỉ định
7. side_effects: Tác dụng phụ`;

    let finalJson = '';
    
    // Try Step 2 (using same or different keys)
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[(startIndex + i) % keys.length];
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${currentKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: formatSystemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: formatUserPrompt }] }],
              generationConfig: {
                response_mime_type: "application/json",
                response_schema: {
                  type: "object",
                  properties: {
                    medicine_name: { type: "string" },
                    adult_dosage: { type: "string" },
                    children_dosage: { type: "string" },
                    usage_instructions: { type: "string" },
                    description: { type: "string" },
                    contraindications: { type: "string" },
                    side_effects: { type: "string" }
                  },
                  required: ["medicine_name", "adult_dosage", "children_dosage", "usage_instructions", "description", "contraindications", "side_effects"]
                }
              }
            }),
            signal: AbortSignal.timeout(20000),
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          finalJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (finalJson) break;
        }
        
        if ([429, 503].includes(response.status)) continue;
      } catch (err) {
        continue;
      }
    }

    if (!finalJson) {
      return NextResponse.json(
        { success: false, error: 'Không thể định dạng dữ liệu sau nhiều lần thử' },
        { status: 503 }
      );
    }

    try {
      const parsedContent = JSON.parse(finalJson);
      const validatedContent = medicineDosageOutputSchema.parse(parsedContent);

      // 3. Upsert into cache
      await supabase
        .from('medicine_dosage_cache')
        .upsert({
          medicine_name_query: normalizedQuery,
          medicine_name: validatedContent.medicine_name,
          adult_dosage: validatedContent.adult_dosage,
          children_dosage: validatedContent.children_dosage,
          usage_instructions: validatedContent.usage_instructions,
          description: validatedContent.description,
          contraindications: validatedContent.contraindications,
          side_effects: validatedContent.side_effects,
          created_at: new Date().toISOString()
        }, { onConflict: 'medicine_name_query' });

      return NextResponse.json({
        success: true,
        data: validatedContent
      });
    } catch (parseError) {
      console.error('Lỗi parse JSON hoặc validate schema:', parseError);
      return NextResponse.json(
        { success: false, error: 'Dữ liệu từ AI không đúng định dạng chuẩn' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Medicine dosage API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

