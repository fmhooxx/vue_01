<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 2、为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="box" style="witch: 400px; height: 600px"></div>
    </el-card>
  </div>
</template>

<script>
// 1、先引入 echarts 文件
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的选项
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  // 3、基于准备好的dom，初始化echarts实例
  async mounted() {
    // 3.1 获取页面元素
    let myEcharts = echarts.init(document.getElementById('box'))
    let { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取失败')
    }
    // 4、指定图表的配置和数据
    let result = _.merge(res.data, this.options)
    // 5、使用刚指定的配置项和数据显示图表。
    myEcharts.setOption(result)
  }
}
</script>

<style lang="less" scoped>
</style>
