<template>
  <!-- 容器 -->
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <el-container>
      <!-- 左边侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggle">|||</div>

        <!-- 导航菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级导航 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级导航模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级导航 -->
            <el-menu-item :index="'/'+Subitem.path+''" v-for="Subitem in item.children" :key="Subitem.id" @click="saveNavstate('/'+Subitem.path+'')">
              <!-- 二级导航模板 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{Subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 保存菜单列表的数组
      menuList: [],
      // 字体图标
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 左侧菜单折叠显示
      isCollapse: false,
      // 用来保存激活项的路径
      activePath:""

    }
  },
  // 一加载就调用
  created() {
    this.getMenuList()
    this.activePath=sessionStorage.getItem("activePath")
  },
  methods: {
    logout() {
      // 清空sessionStorage的token
      window.sessionStorage.clear()

      //跳转到登录页面
      this.$router.push('/login')
    },
    async getMenuList() {
      // 发送请求，获取菜单列表
      const { data: res } = await this.$http.get('menus')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      // 获取列表成功，将请求的数据保存到menuList中
      this.menuList = res.data
    },
    // 点击按钮是否折叠显示，切换操作
    toggle() {
      this.isCollapse = !this.isCollapse
    },
    saveNavstate(activePath){
      // 将activePath保存在sessionStorsge中
      this.activePath=window.sessionStorage.setItem("activePath",activePath)
      // 重新赋值
      this.activePath=activePath
    }
  }
}
</script>

<style lang="less" scoped>
// 将顶级容器设置为高度100%，占满全屏
.home-container {
  height: 100%;
}
// 设置头部区域的样式
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
// 设置侧边栏样式
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
// 设置主体样式
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  text-align: center;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
