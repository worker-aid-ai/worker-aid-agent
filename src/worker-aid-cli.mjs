#!/usr/bin/env node
import { classifyCase, loadJson, printJson } from './lib/core.mjs';
import { getChecklist } from './lib/checklists.mjs';
import { calculateOvertimePay } from './lib/overtime.mjs';
import {
  calculateEconomicCompensation,
  calculateIllegalTerminationCompensation,
  calculateNoWrittenContractDoubleWage,
  calculateWageArrears
} from './lib/amounts.mjs';
import { lookupMinimumWage } from './lib/minimum-wage.mjs';
import { renderArbitrationDraft } from './lib/drafts.mjs';
import { exportDocument } from './lib/exporters.mjs';
import { buildCaseTimeline } from './lib/timeline.mjs';

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
    case 'amount': {
      const kind = required(args[0], '请提供金额类型：wage-arrears | double-wage | economic-compensation | illegal-termination');
      const file = required(args[1], '请提供输入 JSON 文件路径');
      const input = await loadJson(file);
      printJson(calculateAmount(kind, input));
      break;
    }
    case 'minimum-wage': {
      const region = required(args[0], '请提供地区，例如 广东 或 shenzhen');
      const tier = args[1] ?? 1;
      printJson(await lookupMinimumWage(region, tier));
      break;
    }
    case 'timeline': {
      const file = required(args[0], '请提供案情 JSON 文件路径');
      const input = await loadJson(file);
      printJson(buildCaseTimeline(input));
      break;
    }
    case 'draft': {
      const kind = required(args[0], '请提供文书类型，例如 arbitration');
      const file = required(args[1], '请提供案情 JSON 文件路径');
      const input = await loadJson(file);
      if (kind !== 'arbitration') throw new Error(`暂不支持的文书类型：${kind}`);
      console.log(renderArbitrationDraft(input));
      break;
    }
    case 'export': {
      const kind = required(args[0], '请提供文书类型：arbitration | legal-aid-summary | evidence-index');
      const file = required(args[1], '请提供案情 JSON 文件路径');
      const output = required(args[2], '请提供输出文件路径，例如 exports/arbitration.html');
      const input = await loadJson(file);
      printJson(await exportDocument(kind, input, output));
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

function calculateAmount(kind, input) {
  switch (kind) {
    case 'wage-arrears':
      return calculateWageArrears(input);
    case 'double-wage':
      return calculateNoWrittenContractDoubleWage(input);
    case 'economic-compensation':
      return calculateEconomicCompensation(input);
    case 'illegal-termination':
      return calculateIllegalTerminationCompensation(input);
    default:
      throw new Error(`暂不支持的金额类型：${kind}`);
  }
}

function required(value, message) {
  if (!value) throw new Error(message);
  return value;
}

function printHelp() {
  console.log(`Worker Aid Agent CLI\n\nUsage:\n  node src/worker-aid-cli.mjs classify <case.json>\n  node src/worker-aid-cli.mjs checklist <scenario_id>\n  node src/worker-aid-cli.mjs overtime <overtime.json>\n  node src/worker-aid-cli.mjs amount <kind> <amount-input.json>\n  node src/worker-aid-cli.mjs minimum-wage <region> [tier]\n  node src/worker-aid-cli.mjs timeline <case.json>\n  node src/worker-aid-cli.mjs draft arbitration <case.json>\n  node src/worker-aid-cli.mjs export <kind> <case.json> <output.md|html|doc>\n\nAmount kinds:\n  wage-arrears | double-wage | economic-compensation | illegal-termination\n\nExamples:\n  node src/worker-aid-cli.mjs minimum-wage 深圳\n  node src/worker-aid-cli.mjs timeline examples/case-wage-arrears.json\n  node src/worker-aid-cli.mjs amount wage-arrears examples/amount-wage-arrears.json\n  node src/worker-aid-cli.mjs export arbitration examples/case-wage-arrears.json exports/arbitration.html\n`);
}

main().catch((error) => {
  console.error(`\n[worker-aid-agent] ${error.message}`);
  process.exitCode = 1;
});
