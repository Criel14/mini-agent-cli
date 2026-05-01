import type { DeepSeekMessage } from "../llm/llm-types.js";

/**
 * 会话记忆类
 * 用于管理 一个 DeepSeekMessage 数组
 */
export class Memory {
    /**
     * 消息数组
     */
    private messages: DeepSeekMessage[] = [];

    constructor(initialMessages: DeepSeekMessage[] = []) {
        this.messages = initialMessages;
    }

    /**
     * 新增消息
     */
    add(msg: DeepSeekMessage) {
        this.messages.push(msg);
    }

    /**
     * 清空消息
     */
    clear() {
        this.messages.length = 0;
    }

    /**
     * 获取完整的会话记忆
     */
    getAll(): readonly DeepSeekMessage[] {
        return this.messages;
    }
}