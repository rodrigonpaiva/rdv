import fs from 'node:fs';
import path from 'node:path';

const sources = ['package.json', 'package-lock.json', '.npmrc', 'tsconfig.base.json', 'tsconfig.node.json', 'eslint.config.mjs', 'apps', 'packages', 'scripts', 'database'];
const outputs = new Set(['node_modules', 'dist', '.next']);

/** Exclude local state and reject source links so the copy is self-contained. */
export function copyVerificationSources(root, destination) {
  for (const item of sources) {
    fs.cpSync(path.join(root, item), path.join(destination, item), {
      recursive: true,
      filter: (source) => {
        const name = path.basename(source);
        const localEnvironment = name === '.env' || (name.startsWith('.env.') && name !== '.env.example');
        if (localEnvironment || outputs.has(name) || name.endsWith('.tsbuildinfo')) return false;
        // Even an allowed name (such as .env.example) may alias an excluded secret.
        // Reject all included links rather than preserve external access or silently
        // omit a required source. Excluded local files above are never followed.
        if (fs.lstatSync(source).isSymbolicLink()) {
          throw new Error('Verification sources must be regular files/directories, not symbolic links.');
        }
        return true;
      },
    });
  }
}
