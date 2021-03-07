import './public-path'
import Vue from 'vue'
import App from './App.vue'
import routes from './router'
import { store as commonStore } from 'common'
import store from './store'
import VueRouter from 'vue-router'

Vue.config.productionTip = false
let instance = null

function render (props = {}) {
  const { container, routerBase } = props
  const router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? routerBase : process.env.BASE_URL,
    mode: 'history',
    routes
  })

  //子应用还有自己的store
  instance = new Vue({
    router,
    store,
    render: (h) => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 这里是子应用独立运行的环境，实现子应用的登录逻辑
if (!window.__POWERED_BY_QIANKUN__) {

  // 独立运行时，也注册一个名为global的store module
  commonStore.globalRegister(store)
  // 模拟登录后，存储用户信息到global module
  const userInfo = { name: '我是独立运行时名字叫张三' } // 假设登录后取到的用户信息
  /*
      
        //注意区分mutations和actions里边的 setGlobalState 它们是区别的
        //actions里边的setGlobalState还多了一步commit('emitGlobalState', payload);
        //这一步是为了和全局状态同步
        emitGlobalState (state) {
          if (props.setGlobalState) {
            props.setGlobalState(state);
          }
        },

        //这里执行的是mutations里边的方法，并没有往全局同步
        //全局同步发生再mutations


  */
  store.commit('global/setGlobalState', { user: userInfo })

  render()
}

export async function bootstrap () {
  console.log('[vue] vue app bootstraped')
}

/*
注意这里有有一个props的挂载
从生命周期 mount 中获取通信方法，props默认会有onGlobalStateChange和setGlobalState两个api

export function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log(state, prev);
  });
  props.setGlobalState(state);
}

*/
export async function mount (props) {
  console.log('[vue] props from main framework', props)

  //子应用在子应用在mount声明周期可以获取到最新的主应用下发的数据，
  //然后将这份数据注册到一个名为global的vuex module中
  //子应用通过global module的action动作进行数据的更新，更新的同时自动同步回父应用。
  //同时就像上边看到的，子应用还有自己的store
  commonStore.globalRegister(store, props)

  render(props)
}

export async function unmount () {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
