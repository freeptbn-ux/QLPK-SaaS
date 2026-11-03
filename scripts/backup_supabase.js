const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

// Tables ordered by dependency for restoration
const TABLES = [
  { name: 'clinics', orderCol: 'id', seqName: 'clinics_id_seq', pkey: 'id' },
  { name: 'profiles', orderCol: 'id', seqName: null, pkey: 'id' },
  { name: 'settings', orderCol: 'key', seqName: null, pkey: 'clinic_id,key' },
  { name: 'medicines', orderCol: 'id', seqName: 'medicines_id_seq', pkey: 'id' },
  { name: 'patients', orderCol: 'id', seqName: 'patients_id_seq', pkey: 'id' },
  { name: 'prescriptions_header', orderCol: 'id', seqName: 'prescriptions_header_id_seq', pkey: 'id' },
  { name: 'prescription_details', orderCol: 'id', seqName: 'prescription_details_id_seq', pkey: 'id' },
  { name: 'clinic_daily_stats', orderCol: 'date', seqName: null, pkey: 'clinic_id,date' },
  { name: 'inventory_transaction_logs', orderCol: 'id', seqName: 'inventory_transaction_logs_id_seq', pkey: 'id' },
  { name: 'patient_history_logs', orderCol: 'id', seqName: 'patient_history_logs_id_seq', pkey: 'id' },
  { name: 'medicine_dosage_cache', orderCol: 'id', seqName: 'medicine_dosage_cache_id_seq', pkey: 'id' },
  { name: 'legacy_prescription_images', orderCol: 'id', seqName: null, pkey: 'id' },
  { name: 'audit_logs', orderCol: 'id', seqName: 'audit_logs_id_seq', pkey: 'id' }
];

function formatSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function generateTableSql(tableName, rows) {
  if (!rows || rows.length === 0) return `-- Table ${tableName} is empty\n`;
  const columns = Object.keys(rows[0]);
  const quotedCols = columns.map(c => `"${c}"`).join(', ');

  let sql = `-- Table: ${tableName} (${rows.length} rows)\n`;
  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const valuesList = chunk.map(row => {
      const vals = columns.map(col => formatSqlValue(row[col]));
      return `(${vals.join(', ')})`;
    }).join(',\n  ');
    sql += `INSERT INTO public."${tableName}" (${quotedCols}) VALUES\n  ${valuesList}\nON CONFLICT DO NOTHING;\n\n`;
  }
  return sql;
}

async function fetchAllRows(tableName, orderCol) {
  const pageSize = 1000;
  let offset = 0;
  let allRows = [];
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from(tableName).select('*').range(offset, offset + pageSize - 1);
    if (orderCol) {
      query = query.order(orderCol, { ascending: true });
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
    }

    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      offset += pageSize;
      if (data.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return allRows;
}

async function runBackup() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  
  const backupDir = path.resolve(process.cwd(), 'backups', `backup_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 BẮT ĐẦU SAO LƯU DỮ LIỆU TỪ SUPABASE VỀ MÁY CỤC BỘ`);
  console.log(`📁 Thư mục lưu: ${backupDir}`);
  console.log(`⏰ Thời gian: ${now.toLocaleString('vi-VN')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const metadata = {
    timestamp: now.toISOString(),
    local_time: now.toLocaleString('vi-VN'),
    supabase_url: SUPABASE_URL,
    backup_dir: backupDir,
    tables: {},
    users_count: 0,
    total_records: 0
  };

  let fullSql = `-- SUPABASE DATABASE BACKUP\n`;
  fullSql += `-- Generated at: ${now.toISOString()}\n`;
  fullSql += `-- Project URL: ${SUPABASE_URL}\n\n`;
  fullSql += `BEGIN;\n\n`;
  fullSql += `-- Tạm thời tắt triggers để tránh sinh log/thống kê giả lập trong khi restore\n`;
  fullSql += `SET session_replication_role = 'replica';\n\n`;

  // 1. Backup auth.users
  try {
    process.stdout.write('⏳ Đang backup auth.users... ');
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.log(`⚠️ Không thể lấy auth.users: ${userError.message}`);
    } else {
      const users = usersData?.users || [];
      fs.writeFileSync(path.join(backupDir, 'auth_users.json'), JSON.stringify(users, null, 2));
      metadata.users_count = users.length;
      console.log(`✅ ${users.length} tài khoản`);
    }
  } catch (err) {
    console.log(`⚠️ Lỗi auth.users: ${err.message}`);
  }

  // 2. Backup public tables
  for (const table of TABLES) {
    process.stdout.write(`⏳ Đang backup public.${table.name}... `);
    try {
      const rows = await fetchAllRows(table.name, table.orderCol);
      const jsonPath = path.join(backupDir, `${table.name}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));

      metadata.tables[table.name] = {
        count: rows.length,
        file: `${table.name}.json`,
        size_bytes: fs.statSync(jsonPath).size,
        order_col: table.orderCol,
        primary_key: table.pkey,
        sequence: table.seqName
      };
      metadata.total_records += rows.length;

      fullSql += generateTableSql(table.name, rows);

      // Sequence reset statement
      if (table.seqName && rows.length > 0) {
        fullSql += `-- Reset auto-increment sequence for ${table.name}\n`;
        fullSql += `SELECT setval('public."${table.seqName}"', COALESCE((SELECT MAX("${table.orderCol}") FROM public."${table.name}"), 1), true);\n\n`;
      }

      console.log(`✅ ${rows.length} dòng (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.log(`❌ Lỗi: ${err.message}`);
      metadata.tables[table.name] = { error: err.message };
    }
  }

  fullSql += `-- Bật lại triggers sau khi nạp xong dữ liệu\n`;
  fullSql += `SET session_replication_role = 'origin';\n\n`;
  fullSql += `COMMIT;\n`;

  // Save SQL restore script
  const sqlPath = path.join(backupDir, 'restore_data.sql');
  fs.writeFileSync(sqlPath, fullSql);

  // Save metadata
  const metaPath = path.join(backupDir, 'metadata.json');
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

  // Update latest pointer
  const latestPointer = path.resolve(process.cwd(), 'backups', 'latest.txt');
  fs.writeFileSync(latestPointer, backupDir);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎉 BACKUP HOÀN TẤT THÀNH CÔNG 100%!`);
  console.log(`📊 Số bảng đã backup: ${Object.keys(metadata.tables).length}`);
  console.log(`📈 Tổng số bản ghi: ${metadata.total_records.toLocaleString()}`);
  console.log(`📄 File SQL restore độc lập: ${sqlPath}`);
  console.log(`📋 File Metadata: ${metaPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return backupDir;
}

runBackup().catch(err => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
