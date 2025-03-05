<script lang="ts" setup>
import type { FormInstance } from "element-plus";
import { getAIUserListApi } from "@@/apis/ai";
import { usePagination } from "@@/composables/usePagination";
import { Refresh, Search } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";

defineOptions({
  name: "AIUser",
});

interface UserData {
  uid: string;
  register_type: string;
  username: string;
  password?: string;
  [key: string]: any;
}

interface UserRequestData {
  id?: string;
  username: string;
  phone: string;
  password: string;
}

const loading = ref<boolean>(false);
const { paginationData, handleCurrentChange, handleSizeChange } =
  usePagination();

// 表格数据
const tableData = ref<UserData[]>([]);

// 搜索表单
const searchFormRef = ref<FormInstance | null>(null);
const searchData = reactive({
  username: "",
  register_type: "wechat", // 默认微信账号
});

// 注册方式选项
const registerTypeOptions = [
  { label: "微信账号", value: "wechat" },
  { label: "账号密码注册", value: "password" },
];

const dialogVisible = ref<boolean>(false);
const passwordVisible = ref<boolean>(false);

// 切换密码显示/隐藏
function togglePasswordVisible() {
  passwordVisible.value = !passwordVisible.value;
}

// 查看用户详情
function handleDetail(row: UserData) {
  dialogVisible.value = true;
  currentUser.value = row;
}

const currentUser = ref<UserData | null>(null);

// 获取表格数据
async function getTableData() {
  loading.value = true;
  try {
    const params = {
      ...searchData,
      page_size: paginationData.pageSize,
      page_num: paginationData.currentPage,
    };
    const res: any = await getAIUserListApi(params);
    console.log(res);
    const { list = [], pagination } = res.data || {};
    tableData.value = (list || []).map((item: any) => ({
      ...item,
      pwd_show: false,
    }));
    paginationData.total = pagination?.total || 0;
    loading.value = false;
  } catch (error) {
    loading.value = false;
    ElMessage.error("获取数据失败");
  }
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

// 监听分页参数变化
watch(
  [
    () => paginationData.currentPage,
    () => paginationData.pageSize,
    () => searchData.register_type,
  ],
  getTableData,
  { immediate: true },
);
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="register_type" label="账号类型">
          <el-select
            v-model="searchData.register_type"
            placeholder="请选择"
            style="width: 140px"
          >
            <el-option
              v-for="item in registerTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="username" label="用户名">
          <el-input v-model="searchData.username" placeholder="请输入" />
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
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column prop="uid" label="用户ID" align="center" />
          <template v-if="searchData.register_type === 'wechat'">
            <el-table-column prop="openid" label="openID" align="center" />
            <el-table-column prop="nick_name" label="用户名" align="center" />
            <el-table-column prop="avatar" label="头像" align="center">
              <template #default="scope">
                <el-image
                  :src="scope.row.avatar"
                  fit="contain"
                  width="50"
                  height="50"
                />
              </template>
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column prop="username" label="用户名" align="center" />
            <el-table-column prop="password" label="密码" align="center">
              <template #default="scope">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                  "
                >
                  <span>{{
                    scope.row?.pwd_show ? scope.row.password : "********"
                  }}</span>
                  <el-icon
                    class="cursor-pointer"
                    @click="scope.row.pwd_show = !scope.row.pwd_show"
                  >
                    <component :is="scope.row?.pwd_show ? 'Hide' : 'View'" />
                  </el-icon>
                </div>
              </template>
            </el-table-column>
          </template>
          <el-table-column prop="env_type" label="注册平台" align="center" />
          <el-table-column prop="create_time" label="注册时间" align="center" />
          <el-table-column prop="update_time" label="更新时间" align="center" />
          <el-table-column
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                type="primary"
                text
                bg
                size="small"
                @click="handleDetail(scope.row)"
              >
                查看
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
    <!-- 查看详情 -->
    <el-dialog
      v-model="dialogVisible"
      title="用户详情"
      width="50%"
      class="ai-user-dialog"
    >
      <el-descriptions v-if="currentUser" :column="1" border>
        <el-descriptions-item label="账号类型">
          {{
            { wechat: "微信账号", password: "账号密码注册" }[
              searchData.register_type
            ]
          }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="searchData.register_type === 'wechat'"
          label="OpenID"
        >
          {{ currentUser.openid }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="searchData.register_type === 'wechat'"
          label="用户名"
        >
          {{ currentUser.nick_name }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="searchData.register_type === 'wechat'"
          label="头像"
        >
          <el-image
            :src="currentUser.avatar"
            fit="contain"
            style="width: 50px; height: 50px"
          />
        </el-descriptions-item>
        <el-descriptions-item
          v-if="searchData.register_type === 'password'"
          label="用户ID"
        >
          {{ currentUser.uid }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="searchData.register_type === 'password'"
          label="用户名"
        >
          {{ currentUser.username }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="searchData.register_type === 'password'"
          label="密码"
        >
          {{ currentUser.password }}
        </el-descriptions-item>
        <el-descriptions-item label="注册平台">
          {{ currentUser.env_type }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ currentUser.create_time }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ currentUser.update_time }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogVisible = false"> 关闭 </el-button>
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

<style lang="scss">
.ai-user-dialog {
  .el-descriptions__body .el-descriptions__table .el-descriptions__cell {
    word-break: break-all !important;
  }
}
</style>
