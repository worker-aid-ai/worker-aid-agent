import { access, readdir, readFile } from 'node:fs/promises';

const requiredFiles = [
  'README.md',
  'docs/LEGAL_DISCLAIMER.md',
  'docs/PRIVACY_AND_SAFETY.md',
  'data/scenarios.json',
  'data/evidence-checklists.json',
  'src/worker-aid-cli.mjs'
];

for (const file of requiredFiles) {
  await access(file);
}

JSON.parse(await readFile('data/scenarios.json', 'utf-8'));
JSON.parse(await readFile('data/evidence-checklists.json', 'utf-8'));
JSON.parse(await readFile('data/law-basis.json', 'utf-8'));

const skills = await readdir('skills');
if (skills.length < 3) {
  throw new Error('skills 数量过少');
}

console.log('validate ok');
