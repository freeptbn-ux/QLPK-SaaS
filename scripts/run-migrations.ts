import { runDatabaseMigration } from '../src/actions/system';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Đang chạy cập nhật Database (Migrations)...');
  
  if (!process.env.DB_PASSWORD) {
    console.error('❌ Lỗi: Bạn chưa điền DB_PASSWORD vào file .env.local');
    process.exit(1);
  }

  try {
    const result = await runDatabaseMigration();
    console.log('\n--- KẾT QUẢ ---');
    console.log('Thành công:', result.success ? '✅ CÓ' : '❌ KHÔNG');
    if ('summary' in result) console.log('Tổng kết:', result.summary);
    
    if ('results' in result && Array.isArray(result.results)) {
      console.log('\n--- CHI TIẾT TỪNG FILE ---');
      result.results.forEach((r: any) => {
        console.log(`${r.success ? '✅' : '❌'} ${r.file} ${r.error ? `(Lỗi: ${r.error})` : ''}`);
      });
    }

    if (!result.success && 'error' in result) {
      console.error('\nLỗi hệ thống:', result.error);
    }
  } catch (err) {
    console.error('Lỗi không xác định:', err);
  }
}

main();
