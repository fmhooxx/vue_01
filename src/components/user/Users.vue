<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="34">
        <el-col :span="12">
          <el-input placeholder="请输入内容" v-model="userQuery.query" clearable @clear="getUSerList">
            <el-button slot="append" icon="el-icon-search" @click="getUSerList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userListL" border stripe>
        <el-table-column align="center" type="index"></el-table-column>
        <el-table-column align="center" label="姓名" prop="username"></el-table-column>
        <el-table-column align="center" label="邮箱" prop="email"></el-table-column>
        <el-table-column align="center" label="电话" prop="mobile"></el-table-column>
        <el-table-column align="center" label="角色" prop="role_name"></el-table-column>
        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            <!-- {{scope.row}} 包含了服务器返回的这一行的所有数据 -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mint"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mint"
                @click="removeUser(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mint"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userQuery.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userQuery.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addFormClose">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisble" width="50%" @close="editFormDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色权限的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <div>
        <p>当前的用户：{{userInfoList.username}}</p>
        <p>当前的角色：{{userInfoList.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择" clearable>
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则 三个参数
    // 参数一、验证规则 参数二、需要验证的那个值 三、回调函数 验证通过调用回调函数
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      let regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 邮箱合法
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      let regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号
        return cb()
      }
      cb(new Error('请输入正确的手机号码'))
    }
    return {
      userQuery: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      userListL: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisble: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色权限的对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfoList: {},
      // 所有角色的数据
      rolesList: {},
      // 已选中的角色 id 值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUSerList()
  },
  methods: {
    async getUSerList() {
      let { data: res } = await this.$http.get('users', {
        params: this.userQuery
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userListL = res.data.users
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(sizeVal) {
      // console.log(sizeVal)
      this.userQuery.pagesize = sizeVal
      this.getUSerList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(curPage) {
      // console.log(curPage)
      this.userQuery.pagenum = curPage
      this.getUSerList()
    },
    // 监听 switch 开关状态的改变
    async userStateChanged(userinfo) {
      // console.log(userinfo);
      let { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      // console.log(res);
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户更新失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框关闭事件 对话框关闭对表单进行重置
    addFormClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async val => {
        // console.log(val); // 返回的是一个布尔值
        if (!val) return
        // 可以发送添加用用户的网络请求
        let { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUSerList()
      })
    },
    // 点击修改用户
    async showEditDialog(id) {
      // 根据 id 获取到对应的这条数据
      let { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      // console.log(res);
      // 将对应的数据赋值给 editForm
      this.editForm = res.data
      this.editDialogVisble = true
    },
    // 监听修改用户对话框的关闭事件 实现表单的重置操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息 并对表单的信息进行预验证 并提交表单
    editUserInfo() {
      this.$refs.editFormRef.validate(async val => {
        // console.log(val);
        if (!val) return
        // 发起修改用户信息的数据请求
        let { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        // 关闭对话框
        this.editDialogVisble = false
        // 刷新数据列表
        this.getUSerList()
        // 显示提交修改成功的消息
        this.$message.success('修改用户成功')
      })
    },
    // 根据 id 删除用户
    async removeUser(id) {
      let result = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除 则返回值为字符串 confirm
      // 如果用户取消了删除 则返回值为字符串 cancel
      // console.log(result);
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      let { data: res } = await this.$http.delete('users/' + id)
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      // 删除成功 重新获取用户列表
      this.getUSerList()
    },
    // 点击显示分配角色对话框
    async setRole(userInfoList) {
      this.userInfoList = userInfoList
      // 获取所有角色的列表
      let { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击确定按钮 完成角色的分配
    async saveRoleInfo() {
      // 判断用户是否选择了要分配的角色
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      let { data: res } = await this.$http.put(
        `users/${this.userInfoList.id}/role`,
        { rid: this.selectedRoleId }
      )
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('设置角色失败')
      }
      this.$message.success('设置角色成功')
      this.getUSerList()
      this.setRoleDialogVisible = false
    },
    // 当分配角色对话框被关闭的时候 实现表单内容的重置
    editFormDialogClosed() {
      this.selectedRoleId = ''
      this.userInfoList = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 20px;
}
</style>
