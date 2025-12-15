<script lang="ts" setup>
import type { FormInstance } from "element-plus";
import { deleteLowcodePageApi, getLowcodePageListApi } from "@@/apis/lowcode";
import { usePagination } from "@@/composables/usePagination";
import { Delete, Refresh, Search } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";

defineOptions({
  name: "LowCodePage",
});

interface PageData {
  id: string;
  project_id: string;
  name: string;
  remark: string;
  create_time: string;
  update_time: string;
  creator: string;
  creator_id: string;
  [key: string]: any;
}

const loading = ref<boolean>(false);
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();

// 表格数据
const tableData = ref<PageData[]>([]);

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null);
const searchData = reactive<Record<string, any>>({
  name: undefined,
  project_id: undefined,
  creator: undefined,
  sort_field: undefined,
  sort_order: undefined,
});

// 获取表格数据
async function getTableData() {
  loading.value = true;
  try {
    const params = {
      page_size: paginationData.pageSize,
      page_num: paginationData.currentPage,
    };
    Object.keys(searchData).forEach((key) => {
      const val = searchData[key as keyof typeof searchData];
      if (val !== undefined && val !== "") {
        params[key] = val;
      }
    });
    const res: any = await getLowcodePageListApi(params);
    const { list = [], pagination } = res.data || {};
    tableData.value = list || [];
    paginationData.total = pagination?.total || 0;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    ElMessage.error("获取数据失败");
  }
}

// 表格排序事件
function handleSortChange({ prop, order }: { prop: string; order: string }) {
  searchData.sort_field = prop;
  searchData.sort_order = order === "ascending" ? "asc" : "desc";
  getTableData();
}

// 搜索
function handleSearch() {
  paginationData.currentPage === 1
    ? getTableData()
    : (paginationData.currentPage = 1);
}

// 重置搜索
function resetSearch() {
  searchFormRef.value?.resetFields();
  handleSearch();
}

// 表格选中数据
const multipleSelection = ref<PageData[]>([]);

// 表格选择事件
function handleSelectionChange(selection: PageData[]) {
  multipleSelection.value = selection;
}

// 删除
function handleDelete(row: PageData | null, type = "single") {
  if (type === "batch" && !multipleSelection.value.length) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }
  const deleteData = type === "single" ? [row] : multipleSelection.value;
  const ids = deleteData.map((item) => item?.id).join(",");

  ElMessageBox.confirm(`正在删除页面：${ids}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      loading.value = true;
      // TODO: 替换为实际的API调用
      const res: any = await deleteLowcodePageApi({ ids });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        getTableData();
      } else {
        ElMessage.error("删除失败");
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
      ElMessage.error("删除失败");
    }
  });
}

// 监听分页参数变化
watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  getTableData,
  { immediate: true },
);
// 页面配置弹窗
const dialogVisible = ref<boolean>(false);
const currentPageData = ref<any>(null);

// 查看页面配置内容
function handleViewContent(pageData: any) {
  try {
    if (typeof pageData === "string") {
      currentPageData.value = JSON.parse(pageData);
    } else {
      currentPageData.value = pageData;
    }
    dialogVisible.value = true;
  } catch (error) {
    console.error(error);
    ElMessage.error("页面配置格式错误");
  }
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="页面名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="project_id" label="项目ID">
          <el-input v-model="searchData.project_id" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="creator" label="创建者">
          <el-input v-model="searchData.creator" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch"> 重置 </el-button>
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
        <el-table
          :data="tableData"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="ID" align="center" />
          <el-table-column prop="project_id" label="项目ID" align="center" />
          <el-table-column prop="name" label="页面名称" align="center" />
          <el-table-column prop="remark" label="备注" align="center" />
          <el-table-column prop="creator" label="创建者" align="center" />
          <el-table-column prop="creator_id" label="创建者ID" align="center" />
          <el-table-column
            prop="create_time"
            label="创建时间"
            align="center"
            sortable
          />
          <el-table-column
            prop="update_time"
            label="更新时间"
            align="center"
            sortable
          />
          <el-table-column prop="page_data" label="页面配置" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                text
                bg
                size="small"
                @click="
                  () => {
                    const { page_data } = scope.row;
                    handleViewContent(page_data);
                  }
                "
              >
                查看内容
              </el-button>
            </template>
          </el-table-column>
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
    <el-dialog
      v-model="dialogVisible"
      title="页面配置"
      width="60%"
      destroy-on-close
    >
      <pre class="page-data-content">{{
        JSON.stringify(currentPageData, null, 2)
      }}</pre>
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

.page-data-content {
  max-height: 600px;
  overflow: auto;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
