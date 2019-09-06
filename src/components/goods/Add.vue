<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          type="card"
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的 item 项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item1"
                  :key="index"
                  v-for="(item1, index) in item.attr_vals"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传的后台 API 地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片区域 -->
    <!-- <el-dialog title="预览图片" :visible.sync="previewPathDialogVisible" width="30%">
      <img :src="previewPath" alt style="width: 100%" />
    </el-dialog> -->
    <el-dialog title="预览图片" :visible.sync="previewPathDialogVisible" width="50%">
      <el-carousel :interval="4000" type="card" height="200px" ref="imgPathRef">
        <el-carousel-item v-for="(item, i) in imgPath" :key="i">
          <img :src="item" alt="">
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
  </div>
</template>

<script>
// import _ from 'lodash'
export default {
  data() {
    return {
      // 激活当前的步骤条
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 商品所属的分类数组
        goods_cat: [],
        // 上传图片的数组
        pics: [],
        // 商品的介绍
        goods_introduce: '',
        // 商品参数
        attrs: []
      },
      // 添加商品的表单数据对象的验证对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品添加时间', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品添加时间', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片要上传的后台 API 地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置上传的请求头部
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的路径
      previewPath: '',
      // 控制预览图片区域的显示与隐藏
      previewPathDialogVisible: false,
      // 轮播图路径
      imgPath: []
    }
  },
  created() {
    // 获取商品分类数据列表
    this.getCateList()
  },
  methods: {
    async getCateList() {
      let { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },
    // 当级联选择框发生变化的时候 触发该函数
    handleChange() {
      // console.log(this.addForm.goods_cat)
      // 如果当商品所属的分类数组的长度 不等于3 说明选中的不是三级商品分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 在切换 tab 之前所调用的函数 返回一个布尔值
    beforeTabLeave(activeName, oldActiveName) {
      // activeName 即将进入的标签页的名字
      // oldActiveName 即将离开的标签页的名字
      // 当处于第一个面板 且选择的是三级商品的分类 才让跳转
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab被选中的时候触发
    async tabClicked() {
      if (this.activeIndex === '1') {
        let { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        // 把得到的字符串转换成数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        // console.log(res.data)
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        let { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPathDialogVisible = true
      this.previewPath = file.response.data.url
      // console.log(this.previewPath)
    },
    // 处理图片移除效果
    handleRemove(file) {
      // console.log(file)
      // 1、获取将要删除的图片的临时路径
      let filePath = file.response.data.tmp_path
      // 2、从 pics 数组中 找到这个图片对应的索引值
      let index = this.addForm.pics.findIndex(item => item.pics === filePath)
      // console.log(index)
      // 3、调用数组的 splice 方法 把图片信息对象 从 pics 数组中移除
      this.addForm.pics.splice(index, 1)
      // 轮播图
      this.imgPath.splice(index, 1)
      // console.log(this.addForm)
    },
    // 当文件上传成功之后 调用的钩子函数
    handleSuccess(response) {
      // console.log(response)
      // 拼接得到一个图片信息对象
      let path = response.data.url
      this.imgPath.push(path)
      // console.log(this.imgPath)

      let picInfo = { pics: response.data.tmp_path }
      // 将图片信息对象 push 到上传图片的数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    // 点击添加商品 先对表单进行预验证 在提交表单
    add() {
      this.$refs.addFormRef.validate(async val => {
        if (!val) return this.$message.error('请填写表单的必须项')
        // 我们利用lodash将 addForm克隆一份
        // let form = _.closeDeep(this.addForm)
        // form.goods_cat = form.goods_cat.join(',')
        // 动态参数处理
        this.manyTableData.forEach(item => {
          let newmanyTableData = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(' ')
          }
          this.addForm.attrs.push(newmanyTableData)
        })
        this.onlyTableData.forEach(item => {
          let newmonlyTableData = {
            attr_id: item.attr_id,
            attr_value: item.attr_value
          }
          this.addForm.attrs.push(newmonlyTableData)
        })
        let { data: res } = await this.$http.post('goods', {
          goods_name: this.addForm.goods_name,
          goods_cat: this.addForm.goods_cat.join(','),
          goods_price: this.addForm.goods_price,
          goods_number: this.addForm.goods_number,
          goods_weight: this.addForm.goods_weight,
          goods_introduce: this.addForm.goods_introduce,
          pics: this.addForm.pics
        })
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取分类的三级id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 5px 0 0 10px !important;
}
img {
  width: 100%;
}
.el-button {
  margin-top: 15px;
}
</style>
