<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关的参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
            props.checkStrictly
            filterable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick" type="border-card">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  @close="handleClose(index, scope.row)"
                  closable
                  :key="index"
                  v-for="(item, index) in scope.row.attr_vals"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  @click="removeUser(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染 tag 标签 -->
                <el-tag
                  @close="handleClose(index, scope.row)"
                  closable
                  :key="index"
                  v-for="(item, index) in scope.row.attr_vals"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  class="el-icon-delete"
                  @click="removeUser(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addFormClose"
    >
      <!-- 添加参数的表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editFormClose"
    >
      <!-- 添加参数的表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { nextTick } from 'q'
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框双向绑定到的数组
      selectedKeys: [],
      // 被激活的页面的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单数据验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改参数的对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {},
      // 修改参数的表单数据验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类
    async getCateList() {
      let { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择框选中项发生变化 会触发该函数
    async handleChange() {
      // console.log(this.selectedKeys);
      // 如果选中的不是三级 那么就将 selectedKeys 清空
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      }
      // console.log(this.selectedKeys);
      let { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        this.$message.error('获取参数列表失败')
      }
      // console.log(res.data)
      // 把请求回来字符串的数据 转换成数组
      res.data.forEach(item => {
        // console.log(item)
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 利用遍的方式 为数组中的对象添加两个属性
        // 控制输入框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的内容
        item.inputValue = ''
      })
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
        // console.log(this.manyTableData)
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab 页面点击事件的处理函数
    handleTabClick() {
      this.handleChange()
      // console.log(this.activeName)
    },
    // 添加参数的对话框关闭 表单内容重置
    addFormClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加动态参数或者静态属性
    addFormUser() {
      this.$refs.addFormRef.validate(async val => {
        if (!val) return
        let { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        //  this.getCateList()
        this.handleTabClick()
      })
    },
    // 当修改参数的对话框关闭的时候 表单的内容重置
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮 展示修改的对话框 获取要修改的参数
    async showEditDialog(attr_id) {
      let { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes/' + attr_id,
        { params: { attr_sel: this.activeName } }
      )
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error('获取失败')
      }
      // 将 data 里面的值保存在 修改的表单的数据里
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 点击确定按钮 先进行表单的预验证 完成修改操作
    editFormUser() {
      this.$refs.editFormRef.validate(async val => {
        if (!val) return
        let { data: res } = await this.$http.put(
          'categories/' + this.cateId + '/attributes/' + this.editForm.attr_id,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.handleTabClick()
        this.editDialogVisible = false
      })
    },
    // 根据 id 删除参数
    async removeUser(attr_id) {
      let result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      let { data: res } = await this.$http.delete(
        'categories/' + this.cateId + '/attributes/' + attr_id
      )
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.handleTabClick()
    },
    // 当按下 Enter(回车键) 或者失去焦点的时候 触发该函数
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有 return 说明用户有输入内容 那么就要在页面中添加用户输入的内容 并且向服务器发送请求 完成数据的添加
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作单独拿出来 保存到数据库
    async saveAttrVals(row) {
      let { data: res } = await this.$http.put(
        'categories/' + this.cateId + '/attributes/' + row.attr_id,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 点击按钮 展示输入的文本框
    showInput(row) {
      row.inputVisible = true
      // 在更新完数据 并且渲染完 DOM 后 执行 nextTick 中的回调函数
      // 这个下划线的作用就是箭头函数的中的 () 占位符没有意义
      this.$nextTick(_ => {
        // 让输入框自动获取焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的 tag
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用 返回 true 否则返回 false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的 id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[this.selectedKeys.length - 1]
      }
      return null
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 25px 0 25px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 130px;
}
</style>
