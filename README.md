# cospowers-dept-plugin 模板

本项目是业务部门接入 cospowers 通用化工作流的**扩展包模板**。Fork 本项目后按实际情况替换占位内容，即可让 cospowers 的标准 SOP 自动加载并应用本部门沉淀的规范和流程知识。

> **前提：** cospowers >= 0.1.3 已安装，`/plugin list` 可见。
> **设计参考：** `docs/agent-rules/specs/2026-05-13-cospowers-generalization-design.md`

---

## 你需要做什么

### ⛔ 禁止做的事

1. **禁止与 csc 内置 Skill 同名。** 所有 Skill 名称不能与 csc 已有的内置 Skill（如 `kb-query`、`test-code-generator` 等）重名，否则会覆盖内置 Skill 导致核心流程异常。  
   禁止示例：
   1. 新增 `skills/kb-query/SKILL.md`，覆盖 csc 内置知识库查询能力。
   2. 新增 `skills/writing-plans/SKILL.md`，替换 csc 的计划生成流程。
   3. 新增 `skills/test-code-generator/SKILL.md`，导致内置测试生成器不可用。
   4. 将部门 Skill 命名为 `design-spec`、`executing-plans` 等 csc 流程 Skill 名称。
2. **禁止 Skill 内容干预规格开发流程。** Skill 只能描述**本部门**的编码规范、框架约定、排障步骤、测试方法等业务知识，不得包含影响 `writing-plans`、`executing-plans`、`requirement-analysis`、`design-spec` 等流程性 Skill 行为的指令或说明。流程由 csc 统一管控，部门无需也不应干涉。  
   禁止示例：
   1. 在部门 Skill 中要求 AI 跳过 `brainstorming`、`writing-plans` 或 `verification-before-completion`。
   2. 在部门 Skill 中改写需求分析、系统设计、执行计划的章节结构或审批门禁。
   3. 在部门 Skill 中要求 AI 自动提交、自动推送、自动创建 MR，绕过 csc 的提交流程。
   4. 在部门 Skill 中规定“遇到所有任务都先调用本 Skill”，抢占 csc 的流程调度。

### Step 1：Fork 并重命名项目

```bash
git clone <本仓库地址> cospowers-<你的部门名>
cd cospowers-<你的部门名>
```

将所有文件中的占位符统一替换：

| 占位符 | 替换为 |
|-------|-------|
| `<dept>` | 部门英文缩写，如 `scp`、`dmp`、`sre` |
| `<部门名>` | 部门中文名，如 `SCP 研发团队` |
| `<团队名>` | 小团队名，如 `后端研发组` |
| `<产品名>` | 产品名称，如 `SkyCloud Platform` |
| `YYYY-MM-DD` | 实际日期 |

---

### Step 2：填写 A 类流程型 Skill（`skills/` 目录）

这类 Skill 是本部门的**工作流知识**。填写后安装 Plugin，`writing-plans` 会在生成计划时自动发现并写入计划的 `Domain Skills` 区块，`executing-plans` 执行时直接调用——无需手动触发。

| 文件 | 填写内容 | Skill Discovery 归类 |
|-----|---------|-------------------|
| `skills/dept-service-dev/SKILL.md` | 项目结构约定、框架使用约定、禁止模式 | 代码编写 |
| `skills/dept-db-debugging/SKILL.md` | DB 慢查询/死锁/连接池排查步骤、常见根因 | 排障调试 |
| `skills/dept-mq-debugging/SKILL.md` | 消息积压/停滞/重复消费排查步骤 | 排障调试 |
| `skills/dept-unit-test/SKILL.md` | 测试框架选型、Mock 边界、命名约定、禁止反模式 | 单测编写 |
| `skills/dept-e2e-test/SKILL.md` | E2E 框架、测试账号、通过标准、CI 集成 | 测试方法 |

> **不需要的 Skill 可以删除。** 例如部门只用 DB，不用 MQ，可删除 `dept-mq-debugging/`。

---

### Step 3：填写 B 类知识型内容

这类内容通过 `cospowers.config.json` 配置后，AI 在生成文档和检查代码时自动读取应用。

**评估器 Skill（`skills/` 目录）**

| 文件 | 填写内容 |
|-----|---------|
| `skills/dept-aireq-evaluator/SKILL.md` | 本部门的 AI 需求评审专项规则（业务术语约定、AC 完整性要求） |
| `skills/dept-sysreq-evaluator/SKILL.md` | 系统需求评审专项规则（REQ 编号规范、场景覆盖要求） |
| `skills/dept-sysdesign-evaluator/SKILL.md` | 系统设计评审专项规则（架构约束、禁用技术、DFX 一致性检查） |
| `skills/dept-kb-query/SKILL.md` | 如部门有内部知识平台，填写接入方式；否则可删除 |

**规范目录（`rules/` 目录）**

| 文件 | 填写内容 |
|-----|---------|
| `rules/coding-standards/lang-standards.md` | 命名规范、错误处理、日志规范、并发安全、禁止模式 |
| `rules/design-review/dept-checklist.md` | 架构约束、DFX 检查项、安全检查项、禁用技术清单 |
| `rules/dfx/dept-baseline.md` | **必须填具体数字**：SLA、RT P99、TPS、错误率、安全基线 |

**文档模板（`templates/` 目录）**

| 文件 | 填写内容 |
|-----|---------|
| `templates/system-requirement-template.md` | 在 §10 追加本部门专属章节，§1~§9 不可删改 |
| `templates/system-design-template.md` | 在 §8 追加本部门专属章节，§1~§7 不可删改 |

---

### Step 4：更新配置覆盖文件

编辑 `cospowers.config.patch.json`，根据文件中的 `//` 行内说明和 `_comment` 提示，逐项填写本部门的配置覆盖值。

```json
{
  "project": { "product": null },  // ← 填 Daedalus 平台分配的产品名；未在 Daedalus 注册本部门规范/知识时保持 null
  "env": {
    "GITLAB_TOKEN": "glpat-xxxxxx"  // ← 需要 spec-commit 创建 MR 时才填
  }
}
```

**注意事项：**

| 要点 | 说明 |
|------|------|
| 文件格式 | 支持 `//` 行注释（JSONC），与标准 JSON 不兼容，由 `hooks/session-start.js` 解析时自动剥离 |
| 路径填写 | `templates` 和 `rules` 的路径**相对于 cospowers 插件根目录**（`~/.claude/plugins/marketplaces/coswork-marketplace/`），不是当前目录。使用本部门内容时格式为 `../cospowers-<dept>-marketplace/...` |
| null 含义 | `null` = 不覆盖该项，保留 cospowers 默认值。`null` 不会写入主配置 |
| false 含义 | `evaluators` 下设 `false` = 禁用该质量门禁 |
| 字段缺失 | patch 中不存在的 key，config 中原值保留不变 |
| 多余字段 | patch 中 config 不存在的 key，会被新增到 config 中 |

> 此文件由 `hooks/session-start.js` 在每次 Claude Code 会话启动时自动 merge 到 cospowers 主配置，无需手动运行 `cospowers-configure`。

---

### Step 5：发布 Plugin

```bash
# 提交到内部 Git 仓库
git add .
git commit -m "feat: init cospowers-<dept> plugin"
git push origin main

# 更新 .claude-plugin/plugin.json 中的 repository 地址
```

---

### Step 6：安装并激活（每位团队成员执行）

**安装两个 Plugin：**

```bash
# 1. 安装 cospowers 核心插件（如尚未安装）
/plugin marketplace add git@git.sangfor.com:ai-native/cospowers/cospowers.git

/plugin install cospowers

# 2. 安装本部门扩展包
/plugin marketplace add git@your-gitlab.com:your-group/cospowers-<dept>.git

/plugin install cospowers-<dept>
```

**激活配置（必须手动触发）：**

```
两个 Plugin 都安装完成后，在 Claude Code 中运行：

  cospowers-configure

向导会引导你将 cospowers.config.patch.json 中的内容
merge 到当前项目的 cospowers.config.json，所有 B 类扩展点立即生效。
```

> **为什么需要手动触发 cospowers-configure？**
> Plugin 安装只是注册 Skill，不会自动修改项目配置文件。`cospowers-configure` 负责将部门 Plugin 携带的配置片段安全地 merge 到项目级 `cospowers.config.json`，这一步需要你确认每个配置项——避免静默覆盖。

---

### Step 7：验证效果

**验证 B 类（知识型）配置是否生效：**

```bash
# 查看 cospowers.config.json，确认 templates/rules/evaluators 已指向部门路径
cat cospowers.config.json
```

**验证 A 类（流程型）Skill Discovery 是否生效：**

```
在 Claude Code 中发起一个开发任务，触发 writing-plans。
检查生成的计划 header，确认包含 Domain Skills 区块：

  **Domain Skills（from session context）：**
  - 单测编写：`<dept>-unit-test` — ...
  - 排障调试：`<dept>-db-debugging` — ...
  - 代码编写：`<dept>-service-dev` — ...
```

如果 Domain Skills 区块未出现部门 Skill，检查 Plugin 是否正确安装（`/plugin list` 确认可见）。

---

## 项目结构

```
dept-cospowers-plugin/
  ├── .claude-plugin/
  │   └── plugin.json                      # Plugin 元数据，声明 cospowers.extends
  │
  ├── skills/
  │   │
  │   │  ── A 类：流程型 Skill（Skill Discovery 自动发现）──
  │   ├── dept-service-dev/SKILL.md        # 开发 SOP：框架约定、项目结构、禁止模式
  │   ├── dept-db-debugging/SKILL.md       # 排障：DB 慢查询 / 死锁 / 连接池
  │   ├── dept-mq-debugging/SKILL.md       # 排障：消息积压 / 停滞 / 重复消费
  │   ├── dept-unit-test/SKILL.md          # 单测：框架 / Mock 边界 / 命名 / 反模式
  │   ├── dept-e2e-test/SKILL.md           # 测试方法：E2E / 性能 / CI 集成
  │   │
  │   │  ── B 类：知识型（评估器 Skill，通过 evaluators 配置注入）──
  │   ├── dept-aireq-evaluator/SKILL.md    # AI 需求评审专项规则
  │   ├── dept-sysreq-evaluator/SKILL.md   # 系统需求评审专项规则
  │   ├── dept-sysdesign-evaluator/SKILL.md # 系统设计评审专项规则
  │   └── dept-kb-query/SKILL.md           # 部门知识库查询（可选）
  │
  ├── templates/                           # B 类：文档模板（扩展内置模板）
  │   ├── system-requirement-template.md   # §10 追加部门专属章节
  │   └── system-design-template.md        # §8 追加部门专属章节
  │
  ├── rules/                               # B 类：规范目录
  │   ├── coding-standards/
  │   │   └── lang-standards.md            # 编码规范：命名/错误/日志/并发/禁止模式
  │   ├── design-review/
  │   │   └── dept-checklist.md            # 设计评审：架构约束/DFX/安全/禁用技术
  │   └── dfx/
  │       └── dept-baseline.md             # DFX 基线：SLA/RT/TPS/错误率/安全（必须填具体数字）
  │
  └── cospowers.config.patch.json            # 配置覆盖片段，安装后由 cospowers-configure 应用
```

---

## 两类沉淀的集成方式对比

| | A 类：流程型 Skill | B 类：知识型内容 |
|--|------------------|----------------|
| **内容形态** | 可执行的工作流 Skill（SKILL.md） | 规范文档、模板、评估器 Skill |
| **激活方式** | 安装 Plugin 后自动注册到 session，writing-plans 自动发现 | 安装 Plugin 后运行 cospowers-configure 写入 cospowers.config.json |
| **生效时机** | writing-plans 生成计划时写入 Domain Skills，executing-plans 执行时调用 | AI 生成/评审文档和检查代码时自动读取 |
| **用户操作** | 无需手动触发 | 需运行一次 cospowers-configure |
