<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodList">
            <el-button icon="el-icon-search" slot="append" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table 表格区域 -->
      <el-table :data="goodList" border stripe>
        <el-table-column align="center" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="600px"></el-table-column>
        <el-table-column align="center" prop="goods_price" label="商品价格(￥)"></el-table-column>
        <el-table-column align="center" prop="goods_number" label="商品数量"></el-table-column>
        <el-table-column align="center" label="创建时间">
          <template slot-scope="scope">{{ scope.row.add_time | date }}</template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="editGood(scope.row.goods_id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removeUser(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog title="编辑商品" :visible.sync="editDialogVisible" width="50%">
      <!-- 修改表单区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
      >
        <el-form-item label="商品 ID">
          <el-input v-model="editForm.goods_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品介绍">
          <el-input v-html="editForm.goods_introduce"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGoodList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询的参数
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示的条数
        pagesize: 10
      },
      // 商品列表
      goodList: [],
      // 总数据条数
      total: 0,
      // 控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 修改商品的数据对象
      editForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_introduce: ''
      },
      // 修改商品的数据验证对象
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 获取所有的商品列表
    this.getGoodList()
  },
  methods: {
    async getGoodList() {
      let { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
      // console.log(this.goodList)
      // console.log(this.total)
    },
    // 当页面显示的条数发生变化的时候 调用该函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    // 当当前页码发生变化的时候 调用该函数
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodList()
    },
    // 根据 id 删除当前的商品
    async removeUser(goods_id) {
      let result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.error('已取消删除操作')
      }
      let { data: res } = await this.$http.delete('goods/' + goods_id)
      // console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodList()
    },
    // 点击编辑按钮 查询到指定的商品
    async editGood(goods_id) {
      let { data: res } = await this.$http.get('goods/' + goods_id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 对修改表单进行预验证 并且完成提交
    addGoodList() {
      this.$refs.editFormRef.validate(async val => {
        if (!val) return
        let { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, this.editForm)
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getGoodList()
        this.editDialogVisible = false
      })
    },
    // 点击添加商品按钮 跳转到添加商品的页面
    goAdd() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>
