<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            autofocus
            clearable
            v-model="queryInfo.query"
            @clear="getOrderList"
          >
            <el-button icon="el-icon-search" slot="append" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 数据表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column align="center" prop="order_price" label="价格"></el-table-column>
        <el-table-column align="center" label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否发货">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_send === '1'" type="warning">已发货</el-tag>
            <el-tag v-else type="primary">未发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | date}}</template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button
                class="el-icon-edit"
                size="small"
                type="primary"
                @click="editOrder(scope.row.order_id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="物流信息"
              placement="top"
              :enterable="false"
            >
              <el-button class="el-icon-location" size="small" type="success" @click="showOrder"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editFormClose">
      <!-- 修改地址表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <!-- 省市区县的级联选择框 -->
          <el-cascader
            v-model="editForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
        <el-form-item label="订单 Id" prop="order_id">
          <el-input v-model="editForm.order_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="是否发货" prop="is_send">
          <el-input v-model="editForm.is_send"></el-input>
        </el-form-item>
        <el-form-item label="是否支付" prop="pay_status">
          <el-input v-model="editForm.pay_status"></el-input>
        </el-form-item>
        <el-form-item label="订单价格" prop="order_price">
          <el-input v-model="editForm.order_price"></el-input>
        </el-form-item>
        <el-form-item label="订单数量" prop="order_number">
          <el-input v-model="editForm.order_number"></el-input>
        </el-form-item>
        <el-form-item label="支付方式" prop="order_pay">
          <el-input v-model="editForm.order_pay"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示物流信息对话框 -->
    <el-dialog title="物流信息" :visible.sync="OrderDialogVisible" width="50%">
      <!-- 展示物流信息的时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in logistics"
          :key="index"
          :timestamp="activity.time"
        >
          <el-card>{{activity.context}}</el-card>
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="OrderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="OrderDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
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
      // 总数据条数
      total: 0,
      // 订单数据列表
      orderList: [],
      // 省市区联动的数据
      cityData: cityData,
      // 控制修改地址对话框的显示与隐藏
      editDialogVisible: false,
      // 修改地址数据对象
      editForm: {
        address1: [],
        address2: '',
        order_id: '',
        is_send: '',
        pay_status: '',
        order_price: '',
        order_number: '',
        order_pay: ''
      },
      // 修改地址数据的验证规则
      editFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 控制物流信息对话框的现实与隐藏
      OrderDialogVisible: false,
      // 存储物流信息数据
      logistics: []
    }
  },
  created() {
    // 获取订单数据列表
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      let { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 当每页显示的条数发生变化的时候 调用该函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 当当前页码发生变化的时候 调用该函数
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 修改地址
    async editOrder(order_id) {
      let { data: res } = await this.$http.get('orders/' + order_id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单信息失败')
      }
      this.editForm = res.data
      this.editForm.pay_status =
        this.editForm.pay_status === '0' ? '未付款' : '已付款'
      this.editDialogVisible = true
    },
    // 当对话框关闭的时候 对表单内容进行重置
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 查看物流信息
    async showOrder() {
      let { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.logistics = res.data
      this.OrderDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
