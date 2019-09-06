<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true ">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column align="center" type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'venter']"
              :key="item1.id"
              v-for="(item1, index1) in scope.row.children"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环选渲染 二级权限 -->
                <el-row
                  :key="item2.id"
                  v-for="(item2, index2) in item1.children"
                  :class="[index2 === 0 ? '' : 'bdtop', 'venter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 通过 for 循环 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="danger"
                      :key="item3.id"
                      v-for="item3 in item2.children"
                      closable
                      @close="removeRight(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> 当前角色的权限 -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column align="center" type="index"></el-table-column>
        <el-table-column align="center" label="角色名称" prop="roleName"></el-table-column>
        <el-table-column align="center" label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mint"
              @click="modify(scope.row.id)"
            >修改</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mint"
              @click="deleteUser(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mint"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addFormClose">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="modifyDialogVisible"
      width="50%"
      @close="modifyFormClose"
    >
      <el-form
        :model="editModifyFrom"
        :rules="modifyFormRules"
        ref="modifyFormRef"
        label-width="100px"
      >
        <el-form-item label="角色id">
          <el-input v-model="editModifyFrom.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editModifyFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editModifyFrom.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表
      rolesList: [],
      // 所有权限的数据
      rightsList: [],
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改角色对话框的显示与隐藏
      modifyDialogVisible: false,
      // 控制分配权限的对话框的显示与隐藏
      setRightDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 查询到的角色信息对象
      editModifyFrom: {},
      // 添加角色规则的用户对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 修改角色规则的用户对象
      modifyFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 树形控件的属性绑定
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点 id 值数组
      defkeys: [],
      // 即将分配权限的角色 id
      roleId: []
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      let { data: res } = await this.$http.get('roles')
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 页面关闭 表单内容重置
    addFormClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 对表单的输入内容 进行预验证
    addUser() {
      this.$refs.addFormRef.validate(async val => {
        // console.log(val);
        if (!val) return
        let { data: res } = await this.$http.post('roles', this.addForm)
        // console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 添加成功 添加角色对话框隐藏 重新获取角色列表页面的数据 刷新页面
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 根据 id 查询角色的信息
    async modify(id) {
      // console.log(id)
      this.modifyDialogVisible = true
      let { data: res } = await this.$http.get('roles/' + id)
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editModifyFrom = res.data
      // console.log(this.editModifyFrom)
    },
    // 当表单关闭时 重置表单内的输入内容
    modifyFormClose() {
      this.$refs.modifyFormRef.resetFields()
    },
    // 修改角色信息 进行预验证 并提交
    modifyUserInfo() {
      this.$refs.modifyFormRef.validate(async val => {
        if (!val) return
        let { data: res } = await this.$http.put(
          'roles/' + this.editModifyFrom.roleId,
          {
            roleName: this.editModifyFrom.roleName,
            roleDesc: this.editModifyFrom.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        //  关闭对话框
        this.modifyDialogVisible = false
        //  刷新数据
        this.getRolesList()
        // 提示修改成功
        this.$message.success('修改角色信息成功')
      })
    },
    // 根据 id 删除角色信息
    async deleteUser(id) {
      let result = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(result)
      // 点击确定返回一个 confirm 的字符串
      // 点击取消返回一个 cancel 的字符串
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      let { data: res } = await this.$http.delete('roles/' + id)
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 通过 id 删除指定的权限
    async removeRight(role, rightId) {
      let result = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 用户点击确定 返回 confirm 字符串
      // 用户带年纪取消 返回 cancel 字符串
      if (result !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 角色属性
      // console.log(role);
      // 权限 id
      // console.log(rightId);
      let { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('取消权限失败')
      }
      this.$message.success('取消权限成功')
      // this.getRolesList()
      // 直接调用该函数 会导致页面重新刷新 打开的页面也会关闭 所有 不推荐这样使用 可以为当前的角色信息重新赋值
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的列表
      let { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 把获取到的权限数据保存到 rightsList 中
      this.rightsList = res.data
      // 利用递归获取所有的三级权限的 id
      this.getLeafKeys(role, this.defkeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式 获取角色下的所有三级权限的 id 并保存到
    // defkeys 数组中
    getLeafKeys(node, arr) {
      // 如果这个节点没有包含 children 这个属性 说明这个节点是三级节点
      if (!node.children) {
        // 那么就将这个三级节点的 id 值保存到 arr 数组中
        return arr.push(node.id)
      }
      // 如果没有 return 那么说明该节点的还不是三级节点 这个时候遍历该该节点 调用 getLeafKeys()
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 当分配权限的对话框关闭的时候 对内容进行清空
    setRightDialogClose() {
      this.defkeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      let keys = [
        // 获取所有已选中节点的 id 值 返回值是一个数组
        ...this.$refs.treeRef.getCheckedKeys(),
        // 获取所有半选中的节点的 id 值 返回值是一个数组
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      let keyStr = keys.join(',')
      // console.log(keyStr);
      let { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keyStr })
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 8px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.venter {
  display: flex;
  align-items: center;
}
</style>
