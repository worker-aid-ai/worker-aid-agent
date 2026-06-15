const REVIEW_WARNING = '时间线仅用于整理案情和证据顺序，不构成法律意见；日期、时效、管辖和证据证明力需要人工复核。';

export function buildCaseTimeline(input = {}) {
  const facts = input.facts ?? {};
  const terminationDate = facts.terminationDate ?? facts.endDate;
  const candidates = [
    derivedEvent(facts.startDate, '入职', '劳动关系起点，请核对入职登记、劳动合同、考勤或工资记录。', 'facts.startDate'),
    derivedEvent(terminationDate, '解除/离职', '请补充解除、辞退、离职或停工的具体经过。', facts.terminationDate ? 'facts.terminationDate' : 'facts.endDate'),
    ...normalizeEventList(facts.events)
  ].filter(Boolean);

  const events = [];
  const reminders = [];

  for (const event of candidates) {
    if (!isIsoDate(event.date)) {
      reminders.push(`事件“${event.title}”缺少有效日期，请补充 YYYY-MM-DD 格式日期后再用于时效或证据顺序判断。`);
      continue;
    }
    events.push(event);
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'zh-CN'));

  return {
    events,
    reminders,
    warnings: [
      REVIEW_WARNING,
      '不要为补齐时间线而编造日期、通知内容、聊天记录或证据来源。'
    ]
  };
}

function derivedEvent(date, title, description, source) {
  if (!date) return null;
  return normalizeEvent({ date, title, description, source });
}

function normalizeEventList(events) {
  if (!Array.isArray(events)) return [];
  return events.map((event, index) => normalizeEvent({
    ...event,
    title: event?.title || `补充事件 ${index + 1}`,
    source: event?.source || `facts.events[${index}]`
  }));
}

function normalizeEvent(event) {
  return {
    date: String(event.date ?? '').trim(),
    title: String(event.title ?? '未命名事件').trim(),
    description: String(event.description ?? '').trim(),
    source: String(event.source ?? '').trim()
  };
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
