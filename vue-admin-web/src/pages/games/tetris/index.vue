<script lang="ts" setup>
import type { FormInstance } from "element-plus";
import { deleteTetrisScoreApi, getTetrisScoreListApi } from "@@/apis/game";
import { usePagination } from "@@/composables/usePagination";
import { Delete, Refresh, Search } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";

defineOptions({
  name: "TetrisScore",
});

interface ScoreData {
  uid: string;
  username: string;
  score: number;
  create_time: string;
  update_time: string;
  [key: string]: any;
}

const loading = ref<boolean>(false);
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();

// 表格数据
const tableData = ref<ScoreData[]>([]);

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null);
const searchData = reactive({
  username: "",
  uid: "",
  level: undefined,
  sort_field: "",
  sort_order: "",
});

const levelOpts: any = [
  { label: "简单", value: 1 },
  { label: "中等", value: 2 },
  { label: "困难", value: 3 },
  { label: "专家", value: 4 },
];

// 获取表格数据
async function getTableData() {
  loading.value = true;
  try {
    const params = {
      ...searchData,
      page_size: paginationData.pageSize,
      page_num: paginationData.currentPage,
    };
    const res: any = await getTetrisScoreListApi(params);
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
const multipleSelection = ref<ScoreData[]>([]);

// 表格选择事件
function handleSelectionChange(selection: ScoreData[]) {
  multipleSelection.value = selection;
}

// 删除
function handleDelete(row: ScoreData | null, type = "single") {
  if (type === "batch" && !multipleSelection.value.length) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }
  const deleteData = type === "single" ? [row] : multipleSelection.value;
  const ids = deleteData.map((item) => item?.score_id).join(",");

  ElMessageBox.confirm(`正在删除成绩记录：${ids}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      loading.value = true;
      const res: any = await deleteTetrisScoreApi({ ids });
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
        <el-form-item prop="username" label="用户昵称">
          <el-input v-model="searchData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="uid" label="用户ID">
          <el-input v-model="searchData.uid" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="level" label="难度">
          <el-select
            v-model="searchData.level"
            placeholder="请选择"
            style="width: 120px"
          >
            <el-option
              v-for="item in levelOpts"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
          <el-table-column prop="score_id" label="SCORE_ID" align="center" />
          <el-table-column prop="uid" label="用户ID" align="center" />
          <el-table-column prop="username" label="用户昵称" align="center" />
          <el-table-column prop="score" label="成绩" align="center" sortable />
          <el-table-column prop="level" label="难度" align="center">
            <template #default="scope">
              <span>{{
                levelOpts.find((v) => v.value === scope.row.level)?.label || "-"
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="platform" label="平台" align="center" />
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
