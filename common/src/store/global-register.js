
/**
 * 
 * @param {vuex实例} store 
 * @param {qiankun下发的props} props 
 */


function registerGlobalModule (store, props = {}) {

  if (!store || !store.hasModule) {
    return;
  }

  // 获取初始化的state
  const initState = props.getGlobalState && props.getGlobalState() || {
    menu: [],
    user: {}
  };

  // 0.如果没有名为global的module,创建

  if (!store.hasModule('global')) {
    const globalModule = {
      namespaced: true,
      state: initState,
      actions: {
        //2.同时提供了setGlobalState方法供外部调用，内部自动通知同步到父应用。
        //调用方法如下
        // export default {
        //   computed: {
        //     ...mapState('global', {
        //       user: state => state.user, // 获取父应用的user信息
        //     }),
        //   },
        //   methods: {
        //     //从某个module拿到方法
        //     ...mapActions('global', ['setGlobalState']),
        //     update () {
        //       this.setGlobalState('user', { name: '张三' })
        //     }
        //   },
        // };
        

        setGlobalState ({ commit }, payload) {
          commit('setGlobalState', payload);
          commit('emitGlobalState', payload);
        },


        // 初始化，只用于mount时同步父应用的数据
        initGlobalState ({ commit }, payload) {
          commit('setGlobalState', payload);
        },
      },
      mutations: {
        setGlobalState (state, payload) {
          // eslint-disable-next-line
          state = Object.assign(state, payload);
        },
        // 通知父应用
        emitGlobalState (state) {
          if (props.setGlobalState) {
            props.setGlobalState(state);
          }
        },
      },
    };
    
    store.registerModule('global', globalModule);
  } else {
    // 3.如果已经有了global。每次mount时，都同步一次父应用数据
    // 调用的是global里边注册的initGlobalState action
    store.dispatch('global/initGlobalState', initState);
  }
};

export default registerGlobalModule;
