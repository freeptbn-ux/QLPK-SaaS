const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: Credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const TABLES_CONFIG = [
  { name: 'clinics', pkey: 'id' },
  { name: 'profiles', pkey: 'id' },
  { name: 'settings', pkey: 'clinic_id,key' },
  { name: 'medicines', pkey: 'id' },
  { name: 'patients', pkey: 'id' },
  { name: 'prescriptions_header', pkey: 'id' },
  { name: 'prescription_details', pkey: 'id' },
  { name: 'clinic_daily_stats', pkey: 'clinic_id,date' },
  { name: 'inventory_transaction_logs', pkey: 'id' },
  { name: 'patient_history_logs', pkey: 'id' },
  { name: 'medicine_dosage_cache', pkey: 'id' },
  { name: 'legacy_prescription_images', pkey: 'id' },
  { name: 'audit_logs', pkey: 'id' }
];

async function runRestore() {
  const args = process.argv.slice(2);
  let targetDir = null;
  let targetTable = null;
  let isDryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      isDryRun = true;
    } else if (args[i] === '--table' && args[i + 1]) {
      targetTable = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      targetDir = args[i];
    }
  }

  if (!targetDir) {
    const latestPointer = path.resolve(process.cwd(), 'backups', 'latest.txt');
    if (fs.existsSync(latestPointer)) {
      targetDir = fs.readFileSync(latestPointer, 'utf8').trim();
    }
  }

  if (!targetDir || !fs.existsSync(targetDir)) {
    console.error(`❌ Không tìm thấy thư mục backup: ${targetDir}`);
    console.log(`\nCách dùng:`);
    console.log(`  node scripts/restore_supabase.js [đường_dẫn_backup]`);
    console.log(`  node scripts/restore_supabase.js --table prescription_details`);
    console.log(`  node scripts/restore_supabase.js --dry-run\n`);
    process.exit(1);
  }

  const metaFile = path.join(targetDir, 'metadata.json');
  if (!fs.existsSync(metaFile)) {
    console.error(`❌ Thư mục backup không hợp lệ (thiếu metadata.json): ${targetDir}`);
    process.exit(1);
  }

  const metadata = JSON.parse(fs.readFileSync(metaFile, 'utf8'));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔄 KHÔI PHỤC DỮ LIỆU TỪ BACKUP LÊN SUPABASE ${isDryRun ? '(CHẾ ĐỘ KIỂM TRA - DRY RUN)' : ''}`);
  console.log(`📁 Thư mục nguồn: ${targetDir}`);
  console.log(`⏰ Thời điểm backup: ${metadata.local_time || metadata.timestamp}`);
  if (targetTable) console.log(`🎯 Chỉ khôi phục bảng: ${targetTable}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const tablesToProcess = targetTable
    ? TABLES_CONFIG.filter(t => t.name === targetTable)
    : TABLES_CONFIG;

  if (targetTable && tablesToProcess.length === 0) {
    console.error(`❌ Bảng "${targetTable}" không hợp lệ. Các bảng hỗ trợ:\n${TABLES_CONFIG.map(t => t.name).join(', ')}`);
    process.exit(1);
  }

  for (const table of tablesToProcess) {
    const tableName = table.name;
    const jsonPath = path.join(targetDir, `${tableName}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.log(`⚠️ Bỏ qua ${tableName} (không có file json)`);
      continue;
    }

    const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!rows || rows.length === 0) {
      console.log(`ℹ️ Bảng ${tableName} trống trong bản backup.`);
      continue;
    }

    if (isDryRun) {
      console.log(`🔎 [DRY RUN] Bảng ${tableName}: sẵn sàng nạp ${rows.length} dòng (onConflict: ${table.pkey})`);
      continue;
    }

    process.stdout.write(`⏳ Đang restore ${tableName} (${rows.length} dòng)... `);

    const chunkSize = 100;
    let successCount = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from(tableName).upsert(chunk, {
        onConflict: table.pkey,
        ignoreDuplicates: false
      });

      if (error) {
        console.log(`\n❌ Lỗi khi restore bảng ${tableName} (chunk ${i}): ${error.message}`);
        console.error('Chi tiết lỗi:', error);
        break;
      }
      successCount += chunk.length;
    }

    if (successCount === rows.length) {
      console.log(`✅ Hoàn tất (${successCount}/${rows.length} dòng)`);
    } else {
      console.log(`⚠️ Đã restore ${successCount}/${rows.length} dòng.`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(isDryRun ? `✅ DRY RUN HOÀN TẤT: Dữ liệu hợp lệ sẵn sàng restore bất cứ lúc nào.` : `🎉 QUÁ TRÌNH KHÔI PHỤC HOÀN TẤT!`);
  console.log(`💡 File SQL restore độc lập: ${path.join(targetDir, 'restore_data.sql')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runRestore().catch(err => {
  console.error('Fatal restore error:', err);
  process.exit(1);
});
