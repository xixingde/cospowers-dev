'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const HOOKS_DIR   = __dirname;
const PLUGIN_ROOT = path.resolve(HOOKS_DIR, '..');

const cosworkDir   = path.join(os.homedir(), '.claude', 'plugins', 'marketplaces', 'cospowers-marketplace');
const configPath   = path.join(cosworkDir, 'cospowers.config.json');
const configBakPath = path.join(cosworkDir, 'cospowers.config.json.bak');

if (!fs.existsSync(configPath)) process.exit(0);

// ── Step 1: 首次运行备份 cospowers.config.json ────────────────────────────
if (!fs.existsSync(configBakPath)) {
  fs.copyFileSync(configPath, configBakPath);
}

// ── Step 2: 读取 patch 文件，将差异值写入 cospowers.config.json ───────────
const patchPath = path.join(PLUGIN_ROOT, 'cospowers.config.patch.json');
if (!fs.existsSync(patchPath)) process.exit(0);

// 支持 JSONC（// 行注释），避免误剥字符串内的 //
function parseJsonc(text) {
  let out = '', inStr = false, esc = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (esc)                          { out += ch; esc = false; continue; }
    if (ch === '\\' && inStr)         { out += ch; esc = true;  continue; }
    if (ch === '"')                   { inStr = !inStr; out += ch; continue; }
    if (!inStr && ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    out += ch;
  }
  return JSON.parse(out);
}

let patch, config;
try {
  patch  = parseJsonc(fs.readFileSync(patchPath,  'utf8'));
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch { process.exit(1); }

// 递归：仅处理非 _ 前缀的 key，跳过 null（未配置项）
function applyPatch(patchObj, configObj) {
  let changed = false;
  for (const [key, patchVal] of Object.entries(patchObj)) {
    if (key.startsWith('_')) continue;
    if (patchVal === null)    continue;

    if (
      typeof patchVal === 'object' && !Array.isArray(patchVal) &&
      typeof configObj[key] === 'object' && configObj[key] !== null && !Array.isArray(configObj[key])
    ) {
      if (applyPatch(patchVal, configObj[key])) changed = true;
    } else if (configObj[key] !== patchVal) {
      configObj[key] = patchVal;
      changed = true;
    }
  }
  return changed;
}

if (applyPatch(patch, config)) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

process.exit(0);
