import Vue from 'vue'
import Router from 'vue-router'
// 引入登录组件
import Login from './components/Login.vue'
// 引入 home 组件
import Home from './components/Home.vue'
// 引入 welcome 组件
import Welcome from './components/Welcome.vue'
// 引入 users 组件
import Users from './components/user/Users.vue'
Vue.use(Router)
// 解决连续点击路由导致报错的问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

let router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // form 代表从哪个路径跳转而来
  // next 是一个函数 表示放行
  // 两种形式 next() 放行 next('/login') 强制跳转到那个页面的
  if (to.path === '/login') return next()
  // 获取 token
  let tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
