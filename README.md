# Mini CLI Agent

一个用 **TypeScript 实现的极简 AI Agent CLI**，丐版 Claude Code。

* 接收自然语言指令
* 调用大模型（LLM）
* 自动执行工具（读文件 / 写文件 / 执行命令）
* 循环推理直到任务完成

# 技术栈

* TypeScript
* Node.js

# 启动

```bash
npm run dev
```

# 功能设计

## Agent Loop

用户输入 → 调用 LLM → 判断是否需要调用工具 → 执行工具 → 再喂给 LLM → 循环

## Tool

* readFile
* writeFile
* exec
