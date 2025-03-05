<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus"
import {
  addAIModelApi,
  deleteAIModelApi,
  getAIModelListApi,
  updateAIModelApi,
  updateAIModelStatusApi
} from "@@/apis/ai"
import { usePagination } from "@@/composables/usePagination"
import { CirclePlus, Delete, Refresh, Search } from "@element-plus/icons-vue"
// import { ElMessage, ElMessageBox } from "element-plus";

import { reactive, ref } from "vue"

defineOptions({
  name: "AIModel"
})

interface ModelData {
  id: string
  name: string
  label: string
  temperature: number
  company: string
  status: number // 0: 下线, 1: 上线
}

interface ModelRequestData {
  id?: string
  name: string
  label?: string
  temperature: number
  company: string
}

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange }
  = usePagination()

// 表格数据
const tableData = ref<ModelData[]>([])

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: "",
  company: "",
  status: undefined
})

// 新增/编辑表单
const DEFAULT_FORM_DATA: ModelRequestData = {
  name: "",
  label: "",
  temperature: 0.7,
  company: ""
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<ModelRequestData>(DEFAULT_FORM_DATA)
const formRules: FormRules = {
  //   label: [{ required: true, trigger: "blur", message: "请输入模型展示名称" }],
  name: [{ required: true, trigger: "blur", message: "请输入模型名称" }],
  temperature: [
    { required: true, trigger: "blur", message: "请输入temperature值" }
  ],
  company: [{ required: true, trigger: "blur", message: "请输入所属公司" }]
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
    const res: any = await getAIModelListApi(params)
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

// 新增/编辑
function handleCreateOrUpdate() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过")
      return
    }
    loading.value = true
    // TODO: 调用新增/编辑API
    try {
      const { label, name, company, temperature, id } = formData.value
      const params = { label, name, company, temperature }
      let res: any
      if (id) {
        // 编辑
        Object.assign(params, { id })
        res = await updateAIModelApi(params)
      } else {
        // 新增
        res = await addAIModelApi(params)
      }
      console.log(res)
      loading.value = false
      if (res.code === 200) {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getTableData()
      } else {
        ElMessage.error("操作失败")
      }
    } catch {
      loading.value = false
      ElMessage.error("操作失败")
    }
  })
}

// 重置表单
function resetForm() {
  formRef.value?.resetFields()
  formData.value = DEFAULT_FORM_DATA
}

// 表格选中数据
const multipleSelection = ref<ModelData[]>([])

// 表格选择事件
function handleSelectionChange(selection: ModelData[]) {
  multipleSelection.value = selection
}

// 删除
function handleDelete(row: ModelData | null, type = "single") {
  console.log(multipleSelection.value)
  if (type === "batch" && !multipleSelection.value.length) {
    ElMessage.warning("请选择要删除的数据")
    return
  }
  const deleteData = type === "single" ? [row] : multipleSelection.value
  const names = deleteData.map(item => item?.name).join("、")
  const ids = deleteData.map(item => item?.id).join(",")

  ElMessageBox.confirm(`正在删除模型：${names}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      loading.value = true
      const res: any = await deleteAIModelApi({ ids })
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

// 编辑
function handleUpdate(row: ModelData) {
  dialogVisible.value = true
  formData.value = { ...row }
}

// 监听分页参数变化
watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  getTableData,
  { immediate: true }
)
// 修改状态
function handleStatusChange(row: ModelData) {
  const action = row.status === 1 ? "下线" : "上线"
  ElMessageBox.confirm(`确认${action}该模型吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        loading.value = true
        const res: any = await updateAIModelStatusApi({
          id: row.id,
          status: row.status === 1 ? 0 : 1
        })
        if (res.code === 200) {
          ElMessage.success(`${action}成功`)
          getTableData()
        } else {
          ElMessage.error(`${action}失败`)
        }
        loading.value = false
      } catch (error) {
        loading.value = false
        ElMessage.error(`${action}失败`)
      }
    })
    .catch(() => {})
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="模型名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="company" label="模型公司">
          <el-input v-model="searchData.company" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="status" label="状态">
          <el-select
            v-model="searchData.status"
            style="width: 100px"
            placeholder="请选择"
            clearable
          >
            <el-option label="已上线" :value="1" />
            <el-option label="已下线" :value="0" />
          </el-select>
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
            type="primary"
            :icon="CirclePlus"
            @click="dialogVisible = true"
          >
            新增模型
          </el-button>
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
          <el-table-column prop="label" label="展示名称" align="center" />
          <el-table-column prop="name" label="模型名称" align="center" />
          <el-table-column
            prop="temperature"
            label="Temperature"
            align="center"
          />
          <el-table-column prop="company" label="所属公司" align="center" />
          <el-table-column prop="create_time" label="创建时间" align="center" />
          <el-table-column prop="update_time" label="更新时间" align="center" />
          <el-table-column prop="status" label="状态" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? "已上线" : "已下线" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="220"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-button>
              <el-button
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                text
                bg
                size="small"
                @click="handleStatusChange(scope.row)"
              >
                {{ scope.row.status === 1 ? "下线" : "上线" }}
              </el-button>
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
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '新增模型' : '修改模型'"
      width="30%"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="label" label="模型展示名称">
          <el-input v-model="formData.label" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="模型名称">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="temperature" label="Temperature">
          <el-input-number
            v-model="formData.temperature"
            :min="0"
            :max="1"
            :step="0.1"
          />
        </el-form-item>
        <el-form-item prop="company" label="所属公司">
          <el-input v-model="formData.company" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleCreateOrUpdate"
        >
          确认
        </el-button>
      </template>
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
</style>
