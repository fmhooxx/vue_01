<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/1.jpg" alt />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        ref="loginformRef"
        label-width="0px"
        class="login_form"
        :model="loginFrom"
        :rules="loginFromRules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            placeholder="请输入用户名"
            prefix-icon="iconfont icon-user"
            v-model="loginFrom.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            placeholder="请输入密码"
            prefix-icon="iconfont icon-3702mima"
            type="password"
            v-model="loginFrom.password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录数据绑定
      loginFrom: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则对象
      loginFromRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置用户名和密码输入框
    resetLoginForm() {
      // console.log(this)
      this.$refs.loginformRef.resetFields()
    },
    // element-ui 自带的表单验证 validate() 进行表单的预验证 里面的参数是一个函数 返回的是一个布尔值
    login() {
      this.$refs.loginformRef.validate(async val => {
        // console.log(val)
        // 如果返回的布尔值是 false
        // 两种写法相同 下面一种更加简洁
        // if (!val) {
        //   return;
        // } else {
        //   let { data: res } = await this.$http.post("login", this.loginFrom);
        //   if (res.meta.status == 200) {
        //     this.$message.success("登录成功");
        //     window.sessionStorage.setItem("token", res.data.token);
        //     setTimeout(() => {
        //       this.$router.push("/home");
        //     }, 1500);
        //   } else {
        //     this.$message.error("登录失败");
        //     return;
        //   }
        // }
        if (!val) return
        let { data: res } = await this.$http.post('login', this.loginFrom)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // 一、将登录成功之后的 token 保存到客户端的 sessionStorage 中
        // 1、项目中除了登录页面之外的其他 API 接口 必须在登录之后才能访问
        // 2、token 只应当在当前网站打开期间生效 所有将 token 保存在 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token)
        // 二、通过编程式导航跳转到后台主页 路由地址是 /home
        setTimeout(() => {
          this.$router.push('/home')
        }, 1500)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login_box {
  position: relative;
  width: 450px;
  height: 300px;
  background-color: #fff;
}
.avatar_box {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}
.login_form {
  padding: 0 20px;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
