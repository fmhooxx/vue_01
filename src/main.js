import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入 axios 并配置全局
import axios from 'axios'
// 配置 axios 请求地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config 固定写法
  return config
})
// 但是 axios并不 是vue插件，所以不能 使用Vue.use()，所以只能在每个需要发送请求的组件中即时引入。 为了解决这
// 个问题，我们在引入 axios 之后，通过修改原型链，来更方便的使用。
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
