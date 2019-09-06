<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="treeMargin"
        :data="cateList"
        :columns="columns"
        show-index
        index-text="#"
        border
        :selection-type="false"
        :show-row-hover="false"
        :expand-type="false"
      >
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success green" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序模板 order -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="danger" v-else>三级</el-tag>
        </template>
        <!-- 操作模板 opt -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editUser(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateClose">
      <!-- 添加分类表单的具体内容 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="添加分类：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            clearable
            props.checkStrictly
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <!-- 表单的内容修改 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名：" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        // 当前的页码
        pagenum: 1,
        // 每页显示的数据条数
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为 table 指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类的对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 添加的分类的名称
        cat_name: '',
        // 父类分类的 id
        cat_pid: 0,
        // 分类的等级 默认是要添加的是 一级分类
        cat_level: 0
      },
      // 添加分类的表单的验证规则对象
      addCateFormRules: {
        // 添加分类的名称的验证规则
        cat_name: [
          { required: true, message: '请输入添加分类的名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 具体选中的值的属性
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的 id 值的数组
      selectedKeys: [],
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改对话框的表单数据对象
      editForm: {
      },
      // 修改对话框的表单验证对象
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入添加分类的名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      let { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      // console.log(res)
      // 把数据列表赋值给 cateList
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 每页显示的条数发生变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 当前页码发生变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 点击添加按钮 展示添加分类的对话框
    showAddCate() {
      // 先获取父类分类的数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      let { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取父类分类数据列表失败')
      }
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 当选项值发生变化触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys);
      // 如果 selectedKeys 数组的长度 length 大于 0 说明有选中父类分类 反之 说明没有选中任何父类
      if (this.selectedKeys.length > 0) {
        // 父类的 id 它的值是数组的最后一位
        this.addCateForm.cat_pid = this.selectedKeys[2]
        // 为当前的等级赋值 0 是一级 1 是二级 2 是三级 如果选中了父类 那么它里面会有有父类的 id 值 如果有一个父类的 id 值 那么当前的等级就应该是二级 如果里面有两位父类的 id 值 那么它就是三级
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父类的 id
        this.addCateForm.cat_pid = 0
        // 为当前的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类对话框关闭 表单内容重置
    addCateClose() {
      this.$refs.addCateFormRef.resetFields()
      // 将选中的父类分类的 id 值的数据清空
      this.selectedKeys = []
      // 将添加分类的表单数据中的 父类分类的 id 赋值为 0
      this.addCateForm.cat_pid = 0
      // 将添加分类的等级 赋值为 0
      this.addCateForm.cat_level = 0
    },
    // 对表单内容进行预验证 并保存提交
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async val => {
        if (!val) return
        let { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        // console.log(res);
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 根据 id 删除商品分类
    async removeCate(id) {
      let result = await this.$confirm(
        '此操作将永久删除该商品分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(res);
      if (result !== 'confirm') {
        return this.$message.info('已取消该操作')
      }
      let { data: res } = await this.$http.delete('categories/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品分类失败')
      }
      this.$message.success('删除商品分类成功')
      this.getCateList()
    },
    // 根据 id 值查询当前的参数信息
    async editUser(cat_id) {
      let { data: res } = await this.$http.get('categories/' + cat_id)
      if (res.meta.status !== 200) {
        this.$message.error('获取数据失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 点击确定按钮 并对表单进行预验证 并且完成修改操作
    async editUserList() {
      this.$refs.editFormRef.validate(async val => {
      if (!val) return
      let { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, { cat_name: this.editForm.cat_name })
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error('修改失败')
      }
      this.$message.success('修改成功')
      this.getCateList()
      this.editDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.green {
  color: greenyellow;
  font-size: 24px;
}
.red {
  color: red;
  font-size: 24px;
}
.treeMargin {
  margin: 15px 0 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>
