// 雪花算法（Snowflake）,在高并发场景下，生成唯一 ID
class SnowflakeIdGenerator {
    constructor(workerId, dataCenterId) {
        this.workerId = workerId; // 机器标识
        this.dataCenterId = dataCenterId; // 数据中心标识
        this.sequence = 0; // 序列号
        this.lastTimestamp = -1; // 上一次生成 ID 的时间戳

        // 时间戳占用位数
        this.timestampBits = 41;
        // 数据中心占用位数
        this.dataCenterBits = 5;
        // 机器标识占用位数
        this.workerBits = 5;
        // 序列号占用位数
        this.sequenceBits = 12;

        // (-1 << 12) 表示将 -1 的二进制 左移 12 位:
        // ^ 是异或运算，两个位相同为 0，不同为 1：
        /**
         *  11111111 11111111 11111111 11111111  (-1)
            ^
            11111111 11111111 1111 0000 0000 0000  (-1 << 12)
            =
            00000000 00000000 0000 1111 1111 1111  (结果)
         */
        // 最终得到的值是 4095（即 2^12 - 1），这就是 12 位二进制能表示的最大值。
        // 这样写法的目的：生成指定位数的最大值；确保序列号不会超出范围；用于后续的位运算中控制序列号的循环
        // 最大值：在雪花算法中，这个值用于控制每毫秒内可以生成的序列号范围（0-4095），即每毫秒最多可以生成 4096 个不同的 ID。
        this.maxSequence = -1 ^ (-1 << this.sequenceBits);
        this.maxWorkerId = -1 ^ (-1 << this.workerBits);
        this.maxDataCenterId = -1 ^ (-1 << this.dataCenterBits);

        // 偏移量
        this.workerIdShift = this.sequenceBits; // 12
        this.dataCenterIdShift = this.sequenceBits + this.workerBits; // 17
        this.timestampLeftShift =
            this.sequenceBits + this.workerBits + this.dataCenterBits; // 22
    }

    generate() {
        let timestamp = Date.now();
        if (timestamp < this.lastTimestamp) {
            throw new Error('时钟回拨，拒绝生成ID');
        }
        // 高并发场景处理：
        if (timestamp === this.lastTimestamp) {
            // 与运算：当序列号超过 4095 时，与运算会使其归零
            this.sequence = (this.sequence + 1) & this.maxSequence;
            if (this.sequence === 0) {
                // 序列号溢出
                // 等待下一毫秒，每毫秒内最多生成 4096 个 ID
                // 当序列号达到最大值时自动归零，触发等待下一毫秒的逻辑
                // 这是雪花算法保证同一毫秒内生成ID唯一性的关键机制。
                timestamp = this.waitNextMillis(this.lastTimestamp);
            }
        } else {
            this.sequence = 0;
        }
        this.lastTimestamp = timestamp;

        // 时间戳：1740823855582 => 2025 03 01 18:10:55；减去这个值可以减小时间戳的位数，延长可用时间
        // 时间戳左移 22 位; 数据中心 ID 左移 17 位; 工作机器 ID 左移 12 位; 序列号不需要左移
        // | 运算符（按位或）运算的规则是：两个位只要有一个为 1，结果就为 1。
        // 按位或运算符将所有部分组合在一起，生成最终的 ID:
        // 0 - 时间戳差值(41位) - 数据中心ID(5位) - 工作机器ID(5位) - 序列号(12位)
        return (
            ((timestamp - 1740823855582) << this.timestampLeftShift) |
            (this.dataCenterId << this.dataCenterIdShift) |
            (this.workerId << this.workerIdShift) |
            this.sequence
        ).toString();
    }

    // 等待下一毫秒
    waitNextMillis(lastTimestamp) {
        let timestamp = Date.now();
        // 循环直到获取下一毫秒
        while (timestamp <= lastTimestamp) {
            timestamp = Date.now();
        }
        return timestamp;
    }
}

module.exports = SnowflakeIdGenerator;

/**
 * 
这样设计的优点：

ID 整体上按时间自增
同一毫秒内生成的 ID 也是唯一的
不同数据中心/机器生成的 ID 不会冲突
支持每毫秒生成 4096 个不同的 ID
 */
