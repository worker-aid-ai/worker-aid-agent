export function renderArbitrationDraft(input) {
  const worker = input.worker ?? {};
  const employer = input.employer ?? {};
  const facts = input.facts ?? {};
  const claims = input.claims ?? [];

  return `# 劳动人事争议仲裁申请书（草稿）

> 重要提示：本文件为 AI 辅助生成草稿，不构成法律意见。提交前请核验当地仲裁委格式、管辖、主体信息、请求金额、证据编号和时效。

## 申请人

姓名：${worker.name ?? '【劳动者姓名】'}  
身份证号：${worker.idNumberMasked ?? '【脱敏填写，正式提交时按要求填写】'}  
联系电话：${worker.phoneMasked ?? '【联系电话】'}  
住址：${worker.addressMasked ?? '【住址】'}  
工作地点：${worker.city ?? '【工作城市】'}

## 被申请人

名称：${employer.name ?? '【用人单位全称，以营业执照/企查信息为准】'}  
统一社会信用代码：${employer.creditCode ?? '【统一社会信用代码】'}  
住所地：${employer.address ?? '【注册地址/经营地址】'}  
法定代表人：${employer.legalRepresentative ?? '【法定代表人】'}

## 仲裁请求

${renderClaims(claims)}

## 事实与理由

申请人于 ${facts.startDate ?? '【入职日期】'} 入职被申请人，岗位为 ${facts.position ?? '【岗位】'}，工作地点为 ${worker.city ?? '【工作城市】'}，约定/月平均工资为 ${money(facts.monthlySalary)}。

${facts.hasWrittenContract === false ? '入职后，被申请人未依法与申请人签订书面劳动合同。' : '双方劳动合同签订情况为：【请补充】。'}

${facts.unpaidWages ? `截至目前，被申请人尚欠申请人工资约 ${money(facts.unpaidWages)}，具体月份、应发、实发及差额见证据目录和工资明细表。` : '关于工资支付情况：【请按月份补充应发、实发、欠发金额】。'}

${facts.terminationReason ? `关于劳动关系解除/终止情况：${facts.terminationReason}。` : '关于劳动关系解除/终止情况：【如有请补充】。'}

申请人已保存劳动关系、工资支付、考勤、沟通催讨等相关证据。为维护合法权益，依法申请仲裁，请求仲裁委员会支持申请人的仲裁请求。

## 证据目录（示例）

1. 劳动关系证据：劳动合同/offer/工牌/企业微信或工作群/OA账号/考勤记录等；
2. 工资证据：工资条、银行流水、个税记录、社保记录等；
3. 欠薪证据：工资明细表、催讨记录、公司确认欠薪的通知或聊天记录等；
4. 解除证据：解除通知、聊天记录、录音文字整理、账号停用截图等；
5. 其他证据：【请补充】。

## 申请人确认

本人确认以上事实和证据真实、合法、完整，不存在伪造、篡改或隐匿重要事实的情形。

申请人：${worker.name ?? '【签名】'}  
日期：【填写日期】
`;
}

function renderClaims(claims) {
  if (!claims.length) return '1. 【请填写仲裁请求，例如支付拖欠工资、经济补偿、赔偿金等，并列明金额】';
  return claims.map((claim, index) => `${index + 1}. ${claim}；`).join('\n');
}

function money(value) {
  if (value === undefined || value === null || value === '') return '【金额】元';
  return `${Number(value).toLocaleString('zh-CN')} 元`;
}
