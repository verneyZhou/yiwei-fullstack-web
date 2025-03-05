<script lang="ts" setup>
import type { FormInstance } from "element-plus"
import { deleteAIChatApi, getAIChatListApi } from "@@/apis/ai"
import { usePagination } from "@@/composables/usePagination"
import { Delete, Refresh, Search, View } from "@element-plus/icons-vue"
import { reactive, ref } from "vue"

defineOptions({
  name: "AIChat"
})

interface ChatData {
  chat_id: string
  creator: string
  creator_id: string
  create_time: string
  content: string
  model: string
  [key: string]: any
}

interface ChatMessage {
  role: "assistant" | "user"
  content: string
  reasoning_content?: string
}

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange }
  = usePagination()

// 表格数据
const tableData = ref<ChatData[]>([])

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  creator: "",
  model: ""
})

// 对话内容弹窗
const dialogVisible = ref<boolean>(false)
const currentChatContent = ref<ChatMessage[]>([])

// 查看对话内容
function handleViewContent(messages: ChatMessage[]) {
  try {
    currentChatContent.value = messages
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error("对话内容格式错误")
  }
}

// 获取表格数据
async function getTableData() {
  loading.value = true
  try {
    const params = {
      ...searchData,
      page_size: paginationData.pageSize,
      page_num: paginationData.currentPage
    }
    const res: any = await getAIChatListApi(params)
    console.log(res)
    const { list = [], pagination } = res.data || {}
    tableData.value = list || []
    paginationData.total = pagination?.total || 0
    loading.value = false
  } catch (error) {
    loading.value = false
    ElMessage.error("获取数据失败")
  }
}

// 搜索
function handleSearch() {
  paginationData.currentPage === 1
    ? getTableData()
    : (paginationData.currentPage = 1)
}

// 重置搜索
function resetSearch() {
  searchFormRef.value?.resetFields()
  handleSearch()
}

// 表格选中数据
const multipleSelection = ref<ChatData[]>([])

// 表格选择事件
function handleSelectionChange(selection: ChatData[]) {
  multipleSelection.value = selection
}

// 删除
function handleDelete(row: ChatData | null, type = "single") {
  console.log(multipleSelection.value)
  if (type === "batch" && !multipleSelection.value.length) {
    ElMessage.warning("请选择要删除的数据")
    return
  }
  const deleteData = type === "single" ? [row] : multipleSelection.value
  const ids = deleteData.map(item => item?.chat_id).join(",")

  ElMessageBox.confirm(`正在删除聊天记录：${ids}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      loading.value = true
      const res: any = await deleteAIChatApi({ ids })
      if (res.code === 200) {
        ElMessage.success("删除成功")
        getTableData()
      } else {
        ElMessage.error("删除失败")
      }
      loading.value = false
    } catch (error) {
      loading.value = false
      ElMessage.error("删除失败")
    }
  })
}

// 监听分页参数变化
watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  getTableData,
  { immediate: true }
)
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="creator" label="创建者">
          <el-input v-model="searchData.creator" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="model" label="大模型名称">
          <el-input v-model="searchData.model" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button
            type="danger"
            :icon="Delete"
            @click="handleDelete(null, 'batch')"
          >
            批量删除
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column
            prop="chat_id"
            label="chat ID"
            align="center"
            width="100"
          />
          <el-table-column prop="creator" label="创建者" align="center" />
          <el-table-column prop="creator_id" label="创建者ID" align="center" />
          <el-table-column
            prop="messages"
            label="对话内容"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div class="content-column">
                <span>{{ scope.row.content }}</span>
                <el-button
                  type="primary"
                  text
                  bg
                  size="small"
                  :icon="View"
                  @click="handleViewContent(scope.row.messages)"
                >
                  查看内容
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="model" label="大模型名称" align="center" />
          <el-table-column prop="create_time" label="创建时间" align="center" />
          <el-table-column
            fixed="right"
            label="操作"
            width="100"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row, 'single')"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 对话内容弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="对话内容"
      width="60%"
      destroy-on-close
    >
      <div class="chat-container">
        <div
          v-for="(message, index) in currentChatContent"
          :key="index"
          class="message-item"
          :class="[message.role]"
        >
          <template v-if="message.reasoning_content">
            <div class="reasoning-content">
              {{ message.reasoning_content }}
            </div>
          </template>
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.content-column {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.chat-container {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;

  .message-item {
    margin-bottom: 20px;

    &.assistant {
      padding-right: 20%;

      .message-content {
        width: fit-content;
        background-color: var(--el-bg-color-page);
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        padding: 12px;
        color: var(--el-text-color-primary);
      }
    }

    &.user {
      padding-left: 20%;
      display: flex;
      justify-content: flex-end;

      .message-content {
        width: fit-content;
        background-color: var(--el-color-primary-light-9);
        border: 1px solid var(--el-color-primary-light-7);
        border-radius: 8px;
        padding: 12px;
        color: var(--el-text-color-primary);
      }
    }

    .reasoning-content {
      width: fit-content;
      margin-bottom: 8px;
      padding: 8px;
      background-color: var(--el-bg-color);
      border-left: 4px solid var(--el-border-color);
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
}
</style>
