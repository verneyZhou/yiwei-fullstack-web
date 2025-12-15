<template>
  <div>
    <el-button type="primary" plain size="small" @click="open = true"
      >AI助手</el-button
    >
    <el-drawer v-model="open" title="AI助手" size="520px">
      <template #header>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span>AI助手</span>
          <el-space>
            <el-button @click="question = ''">清空输入</el-button>
            <el-button type="danger" @click="clearDialog">清空对话</el-button>
          </el-space>
        </div>
      </template>
      <div class="ai-wrap">
        <div class="ai-msgs">
          <div
            v-for="(m, idx) in messages"
            :key="idx"
            class="msg-row"
            :class="m.role"
          >
            <div class="msg-card" :class="m.role">
              <div class="msg-role" :class="m.role">
                {{ m.role === "user" ? "我" : "AI助手" }}
              </div>
              <div
                v-if="m.role === 'assistant'"
                class="markdown-body"
                v-html="renderMarkdown(m.content)"
              ></div>
              <div v-else class="plain-text">{{ m.content }}</div>
            </div>
          </div>
          <div class="empty-tips">
            <div class="title">示例问题</div>
            <div>• 我是个新手，第一步应该如何开始？</div>
            <div>• 如何添加表格组件？</div>
            <div>• 如何进行接口配置？</div>
            <div>• 如何配置事件流？</div>
            <div>• 怎么发布页面？</div>
          </div>
        </div>
        <div class="ai-input">
          <el-input
            v-model="question"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入在低码平台配置过程中遇到的问题..."
            @keydown.enter.exact.prevent="!sending && handleSend()"
          />
          <div class="actions">
            <el-button type="primary" :loading="sending" @click="handleSend"
              >发送</el-button
            >
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { aiChatStramApi } from "@@/apis/ai";

type Msg = { role: "user" | "assistant"; content: string };

const open = ref(false);
const question = ref("");
const sending = ref(false);
const messages = ref<Msg[]>([]);
const streamCtrl = ref<AbortController | null>(null);
const sessionId = ref(`ai-${Date.now()}`);
const resetNext = ref(false);

function clearDialog() {
  messages.value = [];
  resetNext.value = true;
  streamCtrl.value?.abort();
  streamCtrl.value = null;
  ElMessage.success("已清空对话");
}

async function sendStream(q: string) {
  streamCtrl.value?.abort();
  const controller = new AbortController();
  streamCtrl.value = controller;
  const signal = controller.signal;
  let acc = "";
  messages.value.push({ role: "assistant", content: "正在请求中，请稍等..." });
  try {
    await aiChatStramApi({
      question: q,
      session_id: sessionId.value,
      reset: resetNext.value,
      signal,
      onData: (chunk: string) => {
        acc += chunk;
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") last.content = acc;
      },
    });
  } finally {
    streamCtrl.value = null;
    resetNext.value = false;
  }
}

async function handleSend() {
  const q = question.value.trim();
  if (!q) {
    ElMessage.warning("请输入问题");
    return;
  }
  sending.value = true;
  messages.value.push({ role: "user", content: q });
  try {
    await sendStream(q);
  } catch (e: any) {
    ElMessage.error(e?.message || "服务异常");
    const last = messages.value[messages.value.length - 1];
    if (last?.role === "assistant") last.content = e?.message || "服务异常";
  } finally {
    sending.value = false;
    question.value = "";
  }
}

onUnmounted(() => {
  streamCtrl.value?.abort();
  streamCtrl.value = null;
});

function renderMarkdown(input: string) {
  let s: any = (input || "").replace(/\r\n/g, "\n");
  s = s.replace(/(^|[：:。；;*\s])(\d+)\.\s/g, (_m, _p, n) => `\n${n}. `);
  s = s.replace(/(^|[：:。；;*\s])-\s/g, () => `\n- `);
  const esc = (t: string) =>
    t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(
    /```([\s\S]*?)```/g,
    (_m, code) => `<pre><code>${esc(code)}</code></pre>`,
  );
  s = s.replace(/`([^`]+?)`/g, (_m, code) => `<code>${esc(code)}</code>`);
  s = s.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+?)\*/g, "<em>$1</em>");
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  s = s.split("\n");
  const out: string[] = [];
  let ul: string[] = [];
  let ol: string[] = [];
  const flush = () => {
    if (ul.length)
      out.push("<ul>" + ul.map((li) => `<li>${li}</li>`).join("") + "</ul>"),
        (ul = []);
    if (ol.length)
      out.push("<ol>" + ol.map((li) => `<li>${li}</li>`).join("") + "</ol>"),
        (ol = []);
  };
  for (const line of s) {
    const l = line.trim();
    const m1 = l.match(/^-\s+(.*)$/);
    const m2 = l.match(/^\d+\.\s+(.*)$/);
    if (m1) {
      ol.length && flush();
      ul.push(m1[1]);
      continue;
    }
    if (m2) {
      ul.length && flush();
      ol.push(m2[1]);
      continue;
    }
    flush();
    out.push(l.length ? l : "");
  }
  flush();
  return out.join("<br/>");
}
</script>

<style scoped>
.ai-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.ai-msgs {
  flex: 1;
  overflow: auto;
  padding-right: 8px;
}
.msg-row {
  display: flex;
  margin-bottom: 12px;
}
.msg-row.user {
  justify-content: flex-end;
}
.msg-row.assistant {
  justify-content: flex-start;
}
.msg-card {
  max-width: 85%;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.msg-card.user {
  background: #1677ff22;
}
.msg-card.assistant {
  background: #fff;
  border: 1px solid #eee;
}
.msg-role {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1677ff;
}
.plain-text {
  white-space: pre-wrap;
  word-break: break-word;
}
.empty-tips {
  padding: 12px;
  border-radius: 8px;
  background: #f7f8fa;
  color: #666;
  line-height: 1.8;
}
.empty-tips .title {
  font-weight: 600;
  margin-bottom: 8px;
}
.ai-input {
  border-top: 1px solid #eee;
  padding-top: 8px;
}
.actions {
  text-align: right;
  margin-top: 8px;
}
.markdown-body pre {
  background: #f6f8fa;
  padding: 10px;
  border-radius: 6px;
  overflow: auto;
}
.markdown-body code {
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 4px;
}
.markdown-body a {
  color: #1677ff;
  text-decoration: none;
}
</style>
