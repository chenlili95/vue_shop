import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

//在请求拦截器中给每次发送请求的request添加令牌
axios.interceptors.request.use(function(config) {
    // console.log(config)
    //添加Authorization这个令牌字段
    config.headers.Authorization = sessionStorage.getItem("token");
    return config;
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')