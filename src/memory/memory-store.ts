import type { DeepSeekMessage } from "../llm/llm-types.js";
import { Memory } from "./memory.js";

/**
 * 会话记忆存储
 * 用于管理 memoryId 和 会话记忆
 */
export class MemoryStore {

    // 会话记忆 Map<memoryId, Memory对象>
    private memoryMap = new Map<string, Memory>();

    // 当前 memoryId
    private currentId: string;
    
    /**
     * 构造方法
     * 这里的 “参数属性“ 等价于 ”this.initialMessages = initialMessages;“
     * @param initialMessages 
     */
    constructor(private readonly initialMessages: DeepSeekMessage[]) {
        const firstId = this.createMemory();
        this.currentId = firstId;
    }

    /**
     * 按照时间生成 memoryId
     */
    getMemoryId(): string {
        const now = new Date();

        const yyyy = now.getFullYear();
        const MM = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        const ms = String(now.getMilliseconds()).padStart(3, "0");

        return `mem_${yyyy}${MM}${dd}_${hh}${mm}${ss}_${ms}`;
    }

    /**
     * 创建新的会话记忆
     * @returns 新的 memoryId
     */
    private createMemory(): string {
        const id = this.getMemoryId();
        const memory = new Memory([...this.initialMessages]);
        this.memoryMap.set(id, memory);
        return id;
    }

    /**
     * 创建新会话并赋值 currentId
     * @returns 新会话的 memoryId
     */
    create(): string {
        this.currentId = this.createMemory();
        return this.currentId;
    }

    /**
     * 获取当前的会话记忆
     */
    getCurrentMemory(): Memory {
        const memory = this.memoryMap.get(this.currentId);
        if (!memory) {
            throw new Error(`当前会话不存在: ${this.currentId}`);
        }
        return memory;
    }

    /**
     * 获取当前的 memoryId
     */
    getCurrentId(): string {
        return this.currentId;
    }

    /**
     * 新增消息
     */
    appendMessage(msg: DeepSeekMessage) {
        this.getCurrentMemory().add(msg);
        // TODO 这里做持久化
    }
}