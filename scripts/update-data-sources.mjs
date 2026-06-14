#!/usr/bin/env node
console.log(`Worker Aid Agent 数据源更新占位脚本

当前版本采用人工复核数据源，不自动抓取政策数据。
建议流程：
1. 打开 data/service-portals-cn.json 中的全国入口和地方关键词；
2. 核验省级人社/司法行政/仲裁委官网；
3. 更新 sourceUrl、effectiveDate、lastReviewed、verificationStatus；
4. 运行 npm run validate && npm test。
`);
