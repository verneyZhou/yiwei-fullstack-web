<script lang="ts" setup>
import type { FormInstance } from "element-plus";
import {
  deleteLowcodeProjectApi,
  getLowcodeProjectListApi,
} from "@@/apis/lowcode";
import { usePagination } from "@@/composables/usePagination";
import { Delete, Refresh, Search } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";

defineOptions({
  name: "LowCodeProject",
});

interface ProjectData {
  id: string;
  name: string;
  remark: string;
  logo: string;
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
const tableData = ref<ProjectData[]>([]);

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null);
const searchData = reactive({
  name: "",
  creator: "",
  sort_field: "",
  sort_order: "",
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
    const res: any = await getLowcodeProjectListApi(params);
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
const multipleSelection = ref<ProjectData[]>([]);

// 表格选择事件
function handleSelectionChange(selection: ProjectData[]) {
  multipleSelection.value = selection;
}

// 删除
function handleDelete(row: ProjectData | null, type = "single") {
  if (type === "batch" && !multipleSelection.value.length) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }
  const deleteData = type === "single" ? [row] : multipleSelection.value;
  const ids = deleteData.map((item) => item?.id).join(",");

  ElMessageBox.confirm(`正在删除项目：${ids}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      loading.value = true;
      // TODO: 替换为实际的API调用
      const res: any = await deleteLowcodeProjectApi({ ids });
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
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="项目名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
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
          <el-table-column prop="name" label="项目名称" align="center" />
          <el-table-column prop="remark" label="备注" align="center" />
          <el-table-column prop="logo" label="Logo" align="center" />
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
