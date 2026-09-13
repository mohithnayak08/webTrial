import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getInitialSeedData(): any[] {
  const candidatePaths = [
    path.resolve(__dirname, 'seedData.json'),
    path.resolve(__dirname, '..', 'lib', 'seedData.json'),
    path.resolve(process.cwd(), 'api', 'lib', 'seedData.json'),
    path.resolve(process.cwd(), 'server', 'seedData.json'),
    path.resolve(__dirname, '..', '..', 'server', 'seedData.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn(`[SeedData] Failed to parse ${p}:`, err);
      }
    }
  }

  return [];
}
