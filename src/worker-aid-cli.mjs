#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { classifyCase, loadJson, printJson } from './lib/core.mjs';
import { getChecklist } from './lib/checklists.mjs';
import { calculateOvertimePay } from './lib/overtime.mjs';
import { renderArbitrationDraft } from './lib/drafts.mjs';

const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case 'classify': {
      const file = required(args[0], '请提供案情 JSON 文件路径');
      const input = await loadJson(file);
      printJson(classifyCase(input));
      break;
    }
    case 'checklist': {
      const scenario = required(args[0], '请提供场景 ID，例如 wage_arrears');
      printJson(await getChecklist(scenario));
      break;
    }
    case 'overtime': {
      const file = required(args[0], '请提供加班工资输入 JSON 文件路径');
      const input = await loadJson(file);
      printJson(calculateOvertimePay(input));
      break;
    }
    case 'draft': {
      const kind = required(args[0], '请提供文书类型，例如 arbitration');
      const file = required(args[1], '请提供案情 JSON 文件路径');
      const input = await loadJson(file);
      if (kind !== 'arbitration') {
        throw new Error(`暂不支持的文书类型：${kind}`);
      }
      console.log(renderArbitrationDraft(input));
      break;
    }
    case 'help':
    case undefined:
      printHelp();
      break;
    default:
      throw new Error(`未知命令：${command}`);
  }
}

function required(value, message) {
  if (!value) throw new Error(message);
  return value;
}

function printHelp() {
  console.log(`Worker Aid Agent CLI\n\nUsage:\n  node src/worker-aid-cli.mjs classify <case.json>\n  node src/worker-aid-cli.mjs checklist <scenario_id>\n  node src/worker-aid-cli.mjs overtime <overtime.json>\n  node src/worker-aid-cli.mjs draft arbitration <case.json>\n\nExamples:\n  node src/worker-aid-cli.mjs classify examples/case-wage-arrears.json\n  node src/worker-aid-cli.mjs checklist wage_arrears\n`);
}

main().catch((error) => {
  console.error(`\n[worker-aid-agent] ${error.message}`);
  process.exitCode = 1;
});
