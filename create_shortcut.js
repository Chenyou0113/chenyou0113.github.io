import { execSync } from 'node:child_process';
import fs from 'node:fs';

const psCode = `
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut('C:\\Users\\xiaoy\\OneDrive\\桌面\\一鍵同步Notion部落格.lnk')
$sc.TargetPath = 'C:\\Users\\xiaoy\\OneDrive\\桌面\\cy245577.github.io\\一鍵同步發布.bat'
$sc.WorkingDirectory = 'C:\\Users\\xiaoy\\OneDrive\\桌面\\cy245577.github.io'
$sc.Description = '一鍵同步 Notion 文章'
$sc.Save()
`;

fs.writeFileSync('mk_shortcut.ps1', psCode, 'utf8');
try {
  execSync('powershell -ExecutionPolicy Bypass -File mk_shortcut.ps1');
  console.log('Shortcut created successfully');
} finally {
  if (fs.existsSync('mk_shortcut.ps1')) fs.unlinkSync('mk_shortcut.ps1');
}

