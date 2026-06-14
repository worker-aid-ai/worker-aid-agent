import { access, readdir, readFile } from 'node:fs/promises';

const requiredFiles = [
  'README.md',
  'docs/LEGAL_DISCLAIMER.md',
  'docs/PRIVACY_AND_SAFETY.md',
  'docs/DATA_SOURCES.md',
  'docs/WEB_UI.md',
  'data/scenarios.json',
  'data/evidence-checklists.json',
  'data/minimum-wage-cn-2025.json',
  'data/service-portals-cn.json',
  'src/worker-aid-cli.mjs',
  'src/lib/amounts.mjs',
  'src/lib/minimum-wage.mjs',
  'web/index.html'
];

for (const file of requiredFiles) {
  await access(file);
}

const scenarios = JSON.parse(await readFile('data/scenarios.json', 'utf-8'));
const checklists = JSON.parse(await readFile('data/evidence-checklists.json', 'utf-8'));
const lawBasis = JSON.parse(await readFile('data/law-basis.json', 'utf-8'));
const minimumWage = JSON.parse(await readFile('data/minimum-wage-cn-2025.json', 'utf-8'));
const portals = JSON.parse(await readFile('data/service-portals-cn.json', 'utf-8'));

if (!Array.isArray(scenarios) || scenarios.length < 3) throw new Error('scenarios 数据不足');
if (!checklists || Object.keys(checklists).length < 3) throw new Error('evidence-checklists 数据不足');
if (!lawBasis || Object.keys(lawBasis).length < 1) throw new Error('law-basis 数据不足');
if (!Array.isArray(minimumWage.records) || minimumWage.records.length < 31) throw new Error('minimum wage 地区记录不足');
if (!Array.isArray(portals.regions) || portals.regions.length < 31) throw new Error('service portals 地区记录不足');

const skills = await readdir('skills');
if (skills.length < 8) throw new Error('skills 数量过少');

console.log('validate ok');
