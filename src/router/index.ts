import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout/index.vue'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index.vue'),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/lock',
    component: () => import('@/views/lock.vue'),
    hidden: true,
    meta: { title: '锁定屏幕' }
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile/:activeTab?',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    // 侧边栏示例：全屏展示，不套用后台 Layout（重构选型预览用）
    path: '/demo',
    redirect: '/demo/sidebar-01',
    meta: { title: '侧边栏示例', icon: 'component' },
    children: [
      {
        path: 'sidebar-01',
        component: () => import('@/demo/sidebar-01/page.vue'),
        name: 'SidebarDemo01',
        meta: { title: '01 基础侧边栏', demo: true }
      },
      {
        path: 'sidebar-02',
        component: () => import('@/demo/sidebar-02/page.vue'),
        name: 'SidebarDemo02',
        meta: { title: '02 可折叠分组', demo: true }
      },
      {
        path: 'sidebar-03',
        component: () => import('@/demo/sidebar-03/page.vue'),
        name: 'SidebarDemo03',
        meta: { title: '03 子菜单', demo: true }
      },
      {
        path: 'sidebar-04',
        component: () => import('@/demo/sidebar-04/page.vue'),
        name: 'SidebarDemo04',
        meta: { title: '04 浮动侧边栏', demo: true }
      },
      {
        path: 'sidebar-05',
        component: () => import('@/demo/sidebar-05/page.vue'),
        name: 'SidebarDemo05',
        meta: { title: '05 可折叠子菜单', demo: true }
      },
      {
        path: 'sidebar-06',
        component: () => import('@/demo/sidebar-06/page.vue'),
        name: 'SidebarDemo06',
        meta: { title: '06 下拉式子菜单', demo: true }
      },
      {
        path: 'sidebar-07',
        component: () => import('@/demo/sidebar-07/page.vue'),
        name: 'SidebarDemo07',
        meta: { title: '07 图标折叠侧边栏', demo: true }
      }
    ]
  }
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole.vue'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router
