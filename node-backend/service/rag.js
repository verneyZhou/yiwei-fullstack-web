const crypto = require('crypto');
const path = require('path');
const cache = require('../utils/cache');
const util = require('../utils/util');
const {
    RAG_KEY: { ALIBABA_API_KEY, DEEPSEEK_API_KEY },
} = require('../config');

const AI_CACHE_TTL = Number(process.env.AI_CACHE_TTL || 86400); // 缓存时间，默认 24 小时
const NOTE_PATH = path.resolve(__dirname, '../data/note.md'); // 本地文档路径

// 生成缓存键，用于缓存向量数据库
function hashKey(payload) {
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHash('sha256').update(str).digest('hex');
}

// 加载本地文档，模拟从数据库获取文档内容
async function loadMarkdownWithLoader(filePath) {
    const { TextLoader } = await import('langchain/document_loaders/fs/text');
    const abs = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(__dirname, filePath);
    const loader = new TextLoader(abs);
    return loader.load();
}

// 获取向量数据库
async function getVectorStore() {
    if (global.__lowcode_rag_vs) {
        return global.__lowcode_rag_vs;
    }
    const { MemoryVectorStore } = await import('langchain/vectorstores/memory');
    const { RecursiveCharacterTextSplitter } = await import(
        'langchain/text_splitter'
    );
    const docs = await loadMarkdownWithLoader(NOTE_PATH); // 加载本地文档
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000, // 把当前的文档拆分为更小的 chunk ，size 是 1000 字符
        chunkOverlap: 100, // 每个 chunk 之间的重叠字符数，避免切分时丢失上下文
    });
    const chunks = await splitter.splitDocuments(docs); // 切分文档为块
    const { AlibabaTongyiEmbeddings } = await import(
        '@langchain/community/embeddings/alibaba_tongyi'
    );
    const embeddings = new AlibabaTongyiEmbeddings({
        apiKey: ALIBABA_API_KEY,
    });
    const vs = new MemoryVectorStore(embeddings);
    await vs.addDocuments(chunks);
    global.__lowcode_rag_vs = vs; // 缓存向量数据库
    return vs;
}

// 获取llm
async function getModel() {
    if (global.__lowcode_rag_model) {
        return global.__lowcode_rag_model;
    }
    const { ChatDeepSeek } = await import('@langchain/deepseek');
    const model = new ChatDeepSeek({
        apiKey: DEEPSEEK_API_KEY,
        model: 'deepseek-chat',
        temperature: 0,
    });
    global.__lowcode_rag_model = model;
    return model;
}

// 构建系统提示
function buildSystemPrompt(ctxText) {
    return [
        '你是B端低码平台的配置助手，基于提供的文档回答。',
        '优先输出明确的操作步骤与配置入口，语言简洁、中文。',
        '若问题与文档无关或信息不足，指出无法从文档中找到并给出建议的检索方向。',
        '上下文：',
        ctxText,
    ].join('\n');
}

// 从文档中提取前 maxChars 个字符
function pickTopLines(str, maxChars) {
    if (!str) {
        return '';
    }
    if (str.length <= maxChars) {
        return str;
    }
    return str.slice(0, maxChars);
}

// 加载历史对话记录
async function loadHistory(sessionId) {
    if (!sessionId) {
        return [];
    }
    const key = `rag:hist:${sessionId}`;
    const cached = await cache.get(key);
    try {
        return cached ? JSON.parse(cached) : [];
    } catch {
        return [];
    }
}

async function saveHistory(sessionId, history) {
    if (!sessionId) {
        return;
    }
    const key = `rag:hist:${sessionId}`;
    const arr = Array.isArray(history) ? history.slice(-20) : []; // 取最近 20 条历史
    await cache.set(
        key,
        JSON.stringify(arr),
        'EX',
        Number(process.env.AI_CHAT_TTL || 7200)
    ); // 缓存  2 h
}

// 流式输出
async function streamChat(ctx) {
    const { question = '', session_id = '', reset } = ctx.request.body || {};
    const q = (question || '').toString().trim();
    if (!q) {
        util.fail(ctx, '问题不能为空', 400, null);
        return;
    }
    const sessionId = (session_id || '').toString().trim();
    if (reset) {
        await saveHistory(sessionId, []); // 清空历史记录
    }
    const vs = await getVectorStore(); // 获取向量数据库
    const retriever = vs.asRetriever({ k: 3 }); // 设置检索文档数量为 2
    const ctxDocs = await retriever.invoke(q); // 从向量数据库中检索文档
    //   console.log('====ctxDocs', ctxDocs);
    const ctxText = (ctxDocs || [])
        .map((d) => pickTopLines(d.pageContent, 1800))
        .join('\n---\n'); // 合并检索到的文档内容
    const system = buildSystemPrompt(ctxText); // 构建系统提示
    const { HumanMessage, SystemMessage, AIMessage } = await import(
        '@langchain/core/messages'
    );
    const model = await getModel(); // 获取llm模型
    ctx.set('Content-Type', 'text/event-stream'); // 设置响应内容类型为事件流
    ctx.set('Cache-Control', 'no-cache');
    ctx.set('Connection', 'keep-alive');
    ctx.respond = false;
    ctx.res.writeHead(200);
    try {
        const history = await loadHistory(sessionId); // 加载历史对话记录
        const preMsgs = [];
        for (const m of history.slice(-6)) {
            // 取最近的的6条记录
            if (m.role === 'assistant') {
                preMsgs.push(new AIMessage(m.content));
            } else {
                preMsgs.push(new HumanMessage(m.content));
            }
        }
        // 合并系统提示、历史记录和用户问题, 作为模型输入
        const stream = await model.stream([
            new SystemMessage(system),
            ...preMsgs,
            new HumanMessage(q),
        ]);
        let result = '';
        for await (const chunk of stream) {
            let text = '';
            if (Array.isArray(chunk.content)) {
                const c = chunk.content.find((t) => typeof t.text === 'string');
                text = c ? c.text : '';
            } else if (typeof chunk.content === 'string') {
                text = chunk.content;
            }
            if (text) {
                result += text;
                ctx.res.write(`data: ${text}\n\n`); // 流式输出，同时前端能实时接收
            }
        }
        ctx.res.write('event: done\n');
        ctx.res.write('data: end\n\n');
        ctx.res.end(); // 结束事件流
        // 保存最新的对话记录
        await saveHistory(sessionId, [
            ...history,
            { role: 'user', content: q },
            { role: 'assistant', content: result },
        ]);
    } catch (e) {
        ctx.res.write('event: error\n');
        ctx.res.write(`data: ${String(e?.message || 'stream error')}\n\n`);
        ctx.res.end(); // 结束事件流
    }
}

async function chat(ctx) {
    const { question = '', session_id = '', reset } = ctx.request.body || {};
    const q = (question || '').toString().trim();
    if (!q) {
        throw { code: 400, message: '问题不能为空' };
    }
    const sessionId = (session_id || '').toString().trim();
    if (reset) {
        await saveHistory(sessionId, []);
    }
    const cacheKey = `rag_answer_${hashKey(q)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    const vs = await getVectorStore();
    const retriever = vs.asRetriever({ k: 4 });
    const ctxDocs = await retriever.invoke(q);
    const ctxText = (ctxDocs || [])
        .map((d) => pickTopLines(d.pageContent, 1800))
        .join('\n---\n');
    const system = buildSystemPrompt(ctxText);
    const user = q;
    const model = await getModel();
    // 附加最近历史，降低重复上下文的 token 消耗
    const { HumanMessage, SystemMessage, AIMessage } = await import(
        '@langchain/core/messages'
    );
    const history = await loadHistory(sessionId);
    const preMsgs = [];
    for (const m of history.slice(-6)) {
        // 取最近 6 条历史
        if (m.role === 'assistant') {
            preMsgs.push(new AIMessage(m.content));
        } else {
            preMsgs.push(new HumanMessage(m.content));
        }
    }
    // 调用模型
    const res = await model.invoke([
        new SystemMessage(system),
        ...preMsgs,
        new HumanMessage(user),
    ]);
    let answer = '';
    if (Array.isArray(res.content)) {
        const chunk = res.content.find((c) => typeof c.text === 'string');
        answer = chunk ? chunk.text : '';
    } else if (typeof res.content === 'string') {
        answer = res.content;
    }
    const data = {
        answer,
        sources: (ctxDocs || []).slice(0, 3).map((d) => ({
            source: d.metadata?.source || 'note.md',
            preview: pickTopLines(d.pageContent, 300),
        })),
    };
    await cache.set(cacheKey, JSON.stringify(data), 'EX', AI_CACHE_TTL);
    await saveHistory(sessionId, [
        ...history,
        { role: 'user', content: user },
        { role: 'assistant', content: answer },
    ]);
    return data;
}

// 简单的速率限制器，基于内存缓存实现
// 每个 key 对应一个窗口，窗口内请求次数超过 limit 时，抛出 429 错误
// limit: 每个窗口内允许的最大请求次数
// windowSec: 窗口时间，单位秒
async function rateLimit(ctx, key, limit, windowSec) {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${key}:${Math.floor(now / windowSec)}`;
    const count = await cache.incr(windowKey); // 窗口内请求次数加 1
    if (count === 1) {
        await cache.expire(windowKey, windowSec); // 首次请求时设置过期时间
    }
    if (count > limit) {
        throw { code: 429, message: '请求过于频繁' };
    }
}

module.exports = {
    chat,
    streamChat,
    rateLimit,
};
