import { readFile } from 'node:fs/promises';

const CHECKLISTS = JSON.parse(await readFile(new URL('../../data/evidence-checklists.json', import.meta.url), 'utf-8'));

export async function getChecklist(scenarioId) {
  const checklist = CHECKLISTS[scenarioId];
  if (!checklist) {
    return {
      scenarioId,
      error: '未找到该场景的证据清单',
      availableScenarioIds: Object.keys(CHECKLISTS)
    };
  }
  return {
    scenarioId,
    ...checklist,
    reminder: '证据应尽量保留原始载体；公开提交前必须脱敏。'
  };
}
