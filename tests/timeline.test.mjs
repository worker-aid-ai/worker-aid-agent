import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCaseTimeline } from '../src/lib/timeline.mjs';

test('builds a sorted case timeline from derived and explicit events', () => {
  const result = buildCaseTimeline({
    facts: {
      startDate: '2025-03-01',
      terminationDate: '2025-12-20',
      events: [
        { date: '2025-11-05', title: '第一次催讨工资', description: '通过微信向主管催讨 10 月工资' },
        { date: '2025-04-10', title: '工资开始异常', description: '4 月工资延迟发放' }
      ]
    }
  });

  assert.deepEqual(result.events.map((event) => event.title), [
    '入职',
    '工资开始异常',
    '第一次催讨工资',
    '解除/离职'
  ]);
  assert.equal(result.events[0].date, '2025-03-01');
  assert.equal(result.events[3].description, '请补充解除、辞退、离职或停工的具体经过。');
  assert.match(result.warnings.join('\n'), /人工复核/);
});

test('keeps undated timeline facts in reminders instead of inventing dates', () => {
  const result = buildCaseTimeline({
    facts: {
      startDate: '2025-03-01',
      events: [
        { title: '口头通知不用来上班', description: '公司未出具书面通知' },
        { date: 'not-a-date', title: '日期格式错误' }
      ]
    }
  });

  assert.deepEqual(result.events.map((event) => event.title), ['入职']);
  assert.equal(result.reminders.length, 2);
  assert.match(result.reminders[0], /口头通知不用来上班/);
  assert.match(result.reminders[1], /日期格式错误/);
});

test('uses existing endDate facts as the termination timeline date', () => {
  const result = buildCaseTimeline({
    facts: {
      startDate: '2024-03-01',
      endDate: '2026-05-31'
    }
  });

  assert.deepEqual(result.events.map((event) => event.date), ['2024-03-01', '2026-05-31']);
  assert.equal(result.events[1].title, '解除/离职');
});
