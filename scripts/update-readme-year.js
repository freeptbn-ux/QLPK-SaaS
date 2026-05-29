const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname, '../README.md');
if (fs.existsSync(readmePath)) {
  let content = fs.readFileSync(readmePath, 'utf8');
  const currentYear = new Date().getFullYear();
  
  // Replace '{this_year}' placeholder or any previous 4-digit year format
  const updatedContent = content.replace(/Copyright \{this_year\} Nguyễn Duy Trường|Copyright \d{4} Nguyễn Duy Trường/g, `Copyright ${currentYear} Nguyễn Duy Trường`);
  
  fs.writeFileSync(readmePath, updatedContent, 'utf8');
  console.log(`[README Build Tool] Updated copyright year to ${currentYear}`);
} else {
  console.error('[README Build Tool] README.md not found');
}
