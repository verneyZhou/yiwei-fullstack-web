<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus";
import type { LoginRequestData } from "./apis/type";
import { useSettingsStore } from "@/pinia/stores/settings";
import { useUserStore } from "@/pinia/stores/user";
import ThemeSwitch from "@@/components/ThemeSwitch/index.vue";
import { Key, Lock, User } from "@element-plus/icons-vue";
import { getLoginCodeApi, loginApi } from "./apis";
import { useFocus } from "./composables/useFocus";

const router = useRouter();

const userStore = useUserStore();

const settingsStore = useSettingsStore();

const { isFocus, handleBlur, handleFocus } = useFocus();

/** 登录表单元素的引用 */
const loginFormRef = ref<FormInstance | null>(null);

/** 登录按钮 Loading */
const loading = ref(false);

/** 验证码图片 URL */
const captchaInfo = ref<any>(null);

/** 登录表单数据 */
const loginFormData: LoginRequestData = reactive({
  username: "admin",
  password: "123456",
  code: "",
});

/** 登录表单校验规则 */
const loginFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 2, max: 16, message: "长度在 2 到 16 个字符", trigger: "blur" },
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

/** 登录 */
function handleLogin() {
  loginFormRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error("表单校验不通过");
      return;
    }
    loading.value = true;
    const params = {
      ...loginFormData,
      captcha_id: captchaInfo.value?.id,
    };
    loginApi(params)
      .then(({ data }) => {
        userStore.setToken(data.token);
        router.push("/");
      })
      .catch(() => {
        // loginFormData.password = "";
      })
      .finally(() => {
        loading.value = false;
      });
  });
}

/** 创建验证码 */
function createCode() {
  // 清空已输入的验证码
  loginFormData.code = "";
  // 清空验证图片
  captchaInfo.value = null;
  // 获取验证码图片
  getLoginCodeApi().then((res) => {
    console.log(res);
    captchaInfo.value = res.data || null;
  });
}
</script>

<template>
  <div class="login-container">
    <ThemeSwitch v-if="settingsStore.showThemeSwitch" class="theme-switch" />
    <!-- <Owl :close-eyes="isFocus" /> -->
    <div class="login-card">
      <div class="title">
        <!-- <img src="@@/assets/images/layouts/logo-text-2.png" /> -->
        <h2>后台管理系统2.0</h2>
      </div>
      <div class="content">
        <el-form
          ref="loginFormRef"
          :model="loginFormData"
          :rules="loginFormRules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginFormData.username"
              placeholder="用户名"
              type="text"
              tabindex="1"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="密码"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <el-form-item prop="code">
            <el-input
              v-model.trim="loginFormData.code"
              placeholder="验证码"
              type="text"
              tabindex="3"
              :prefix-icon="Key"
              maxlength="4"
              size="large"
              @blur="handleBlur"
              @focus="handleFocus"
            >
              <template #append>
                <div
                  @click="createCode"
                  style="width: 100px; height: 40px; text-align: center"
                >
                  <el-image
                    v-if="captchaInfo?.image"
                    :src="captchaInfo?.image || ''"
                    draggable="false"
                  >
                    <!-- <template #placeholder>
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </template>
                  <template #error>
                    <el-icon>
                      <Loading />
                    </el-icon>
                  </template> -->
                  </el-image>
                  <span v-else> 获取验证码 </span>
                </div>
              </template>
            </el-input>
          </el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            @click.prevent="handleLogin"
          >
            登 录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;
  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }
  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: var(--el-bg-color);
    overflow: hidden;
    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 150px;
      img {
        height: 100%;
      }
    }
    .content {
      padding: 20px 50px 50px 50px;
      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;
        .el-image {
          width: 100px;
          height: 40px;
          border-left: 0px;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }
      .el-button {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}
</style>
