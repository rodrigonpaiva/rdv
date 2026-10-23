import fs from 'node:fs';
import path from 'node:path';

const directory = 'apps/web/.next/static';
if (!fs.existsSync(directory)) throw new Error('Build the web application before checking client artifacts.');
const forbidden = ['BK003_WEB_SECRET_CANARY_b431ef', 'prepareServerRuntime', 'secret resolution failed', 'secret://development/platform/database'];
let checked = 0;
function visit(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (/\.(?:js|map|json|html)$/.test(entry.name)) {
      checked++;
      const text = fs.readFileSync(file, 'utf8');
      if (forbidden.some((marker) => text.includes(marker))) throw new Error('Server-only configuration material found in client artifacts.');
    }
  }
}
visit(directory);
if (!checked) throw new Error('No client artifacts found; refusing a vacuous secret check.');
console.log(`Client secret-canary check passed: ${checked} artifacts; server configuration is not bundled.`);
