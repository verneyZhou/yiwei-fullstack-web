class MemoryCache {
    constructor() {
        this.store = new Map();
        this.maxSize = Number(process.env.AI_CACHE_MAX || 1000); // 最大缓存数量，默认 1000
        this.cleanupInterval = Number(process.env.AI_CACHE_CLEANUP_MS || 60000); // 清理间隔，默认 60 秒
        // 在 Node.js 中， setInterval 返回一个 Timeout 对象（定时器句柄），它有 ref() / unref() 方法。调用 unref() 表示“这个定时器不应让进程保持存活”。也就是：如果进程里只剩这个定时器在等待，Node 可以正常退出，而不会因为定时器一直在而挂住。
        setInterval(() => this.cleanup(), this.cleanupInterval).unref?.();
    }
    // 清理过期键值对
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (entry.exp && now > entry.exp) this.store.delete(key);
        }
        // 简单容量控制：超过容量时随机移除部分键
        if (this.store.size > this.maxSize) {
            const removeCount = Math.floor(this.store.size * 0.1);
            let i = 0;
            for (const k of this.store.keys()) {
                this.store.delete(k);
                if (++i >= removeCount) break;
            }
        }
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (entry.exp && Date.now() > entry.exp) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, arg1, arg2) {
        let exp = null;
        if (arg1 === 'EX' && typeof arg2 === 'number')
            exp = Date.now() + arg2 * 1000;
        this.store.set(key, { value, exp });
        return 'OK';
    }
    // 简单的 递增 操作，不支持过期时间
    async incr(key) {
        const cur = await this.get(key);
        const next = (Number(cur) || 0) + 1;
        const entry = this.store.get(key) || {};
        this.store.set(key, { value: String(next), exp: entry.exp || null });
        return next;
    }
    // 设置键的过期时间，单位秒
    async expire(key, seconds) {
        const entry = this.store.get(key);
        if (!entry) return 0;
        entry.exp = Date.now() + seconds * 1000;
        this.store.set(key, entry);
        return 1;
    }
}

module.exports = new MemoryCache();
