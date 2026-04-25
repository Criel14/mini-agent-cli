import type { DeepSeekMessage } from "../llm/llm-types.js";

/**
 * 会话记忆类
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
        // TODO 会话记忆持久化
    }

    /**
     * 获取完整的会话记忆
     */
    getAll() {
        return this.messages;
    }
}