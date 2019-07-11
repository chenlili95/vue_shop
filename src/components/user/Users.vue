<template>
<div>
   
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList" ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 展示用户列表表格 -->
    <el-table :data="userlist" stripe border>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="手机号码"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
      </el-table-column>
      <el-table-column  label="操作" >
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
          <!-- 提示信息tooltip -->
          <el-tooltip  effect="dark" content="分配角色" placement="top">
              <!-- 分配角色 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>

        </el-tooltip> 
        </template>
      </el-table-column> 
    </el-table>
    <!-- 分页区域 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[2, 3, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
    <!-- 弹窗主体 -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
    </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>



  <!-- 修改用户对话框 -->

  <el-dialog title="修改用户" :visible.sync="editdialogVisible" width="50%" @close="editDialogClosed" >
  <!-- 弹窗主体 -->
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" >
        <el-form-item label="用户名" >
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
    </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>

 <!-- 分配角色对话框 -->
 <el-dialog title="分配角色" :visible.sync="setRoledialogVisible" width="50%" @close="setRoleDialogClosed">
  <div>
     <p>当前的用户：{{userInfo.username}}</p>
     <p>当前的用户：{{userInfo.role_name}}</p>
     <p>分配新角色：<el-select v-model="selectedRoleId" placeholder="请选择">
    <el-option
      v-for="item in roleslist"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select></p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoledialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>



</div>
</template>
<script>
export default {
    data(){
      // 验证邮箱规则
      var checkEmail=(rule, value, callback)=>{
        const regEmail = /^\w+@\w+(\.\w+)+$/
        if(regEmail.test(value)){
          // 合法邮箱
          return callback()
        } 
        callback(new Error("请输入合法邮箱")) 
      }
      // 验证手机号规则
       var checkMobile=(rule, value, callback)=>{
         const regMobile = /^1[34578]\d{9}$/
         if(regMobile.test(value)){
          //  合法的手机号
          return callback()
         }
          callback(new Error("请输入合法手机号"))
      }
        return {
            // 声明一个queryInfo对象保存查询用户列表时需要传递的参数
            queryInfo:{
                query:"",
                pagenum:1,
                pagesize:2
            },
            // 声明一个数组保存请求回来的数据
            userlist:[],
            // 用来保存总条数
            total:0,
            // 控制添加用户弹出框显示与隐藏
            addDialogVisible: false,
            // 保存添加用户的信息
            addForm:{
              username:'',
              password:'',
              email:'',
              mobile:''
            },
            // 添加用户表单验证规则对象
           addFormRules: {
              // 验证用户名是否合法
              username: [
                { required: true, message: '请输入用户名称', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在 3 到 10个字符', trigger: 'blur' }
              ],
              // 验证密码是否合法
              password: [
                { required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, max: 15, message: '长度在 6 到 15个字符', trigger: 'blur' }
              ],
              // 验证邮箱
              email: [
                { required: true, message: '请输入邮箱', trigger: 'blur' },
                {
                  validator: checkEmail,
                  message: '邮箱格式不正确，请重新输入',
                  trigger: 'blur'
                }
              ],
              // 验证手机号码
              mobile: [
                { required: true, message: '请输入手机号码', trigger: 'blur' },
                {
                  validator: checkMobile,
                  message: '手机号码不正确，请重新输入',
                  trigger: 'blur'
                }
              ]
      },
      // 控制修改用户弹出框显示与隐藏
      editdialogVisible:false,
      //查询到的用户信息对象
      editForm:{},
      // 保存修改用户的信息
            editForm:{
              username:'',
              email:'',
              mobile:''
            },
            // 修改用户表单验证规则对象
           editFormRules: {
              // 验证邮箱
              email: [
                { required: true, message: '请输入邮箱', trigger: 'blur' },
                {
                  validator: checkEmail,
                  message: '邮箱格式不正确，请重新输入',
                  trigger: 'blur'
                }
              ],
              // 验证手机号码
              mobile: [
                { required: true, message: '请输入手机号码', trigger: 'blur' },
                {
                  validator: checkMobile,
                  message: '手机号码不正确，请重新输入',
                  trigger: 'blur'
                }
              ]
      },
      // 控制分配角色对话框显示与隐藏
        setRoledialogVisible:false,
      // 需要被分配角色的用户信息
      userInfo:{},
      // 所有角色的数据列表
      roleslist:[],
      //已选中角色的ID值
      selectedRoleId:''



      }
    },
    // 一加载就调用
    created(){
        this.getUserList()
    },
    methods:{
      async getUserList(){
        //   发送请求获取用户列表数据
      const {data:res}= await this.$http.get("users",{params:this.queryInfo})
      // console.log(res)

    // 判断获取是否成功
    if(res.meta.status!==200) return this.$message.error(res.meta.msg);

    // 获取数据成功，将获取的数据保存到data中
    this.userlist=res.data.users;
    this.total=res.data.total
    
        },
    handleSizeChange(newSize){
      // @current-change事件
        console.log("handleSizeChange:"+newSize)
        this.queryInfo.pagesize=newSize
        this.getUserList()
    },
    handleCurrentChange(newPaze){
      //  @size-change事件
        console.log("handleCurrentChange:"+newPaze)
        this.queryInfo.pagenum=newPaze
        this.getUserList()
    },
    // 监听switch开关状态的改变
   async userStateChanged(userInfo){
        // console.log(userInfo)
        // 调用接口，保存状态
       const {data:res}=await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      //  console.log(res)

      // 判断更新的情况
      if(res.meta.status!==200) return  this.$message.error("更新用户状态失败")
      this.$message.success("更新用户状态成功")

    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser(){
      this.$refs.addFormRef.validate(async valid=>{
        // console.log(valid)
        if(!valid) return 
        // 发起添加用户的请求
        const {data:res}= await this.$http.post("users",this.addForm)
        // console.log(res)
        if(res.meta.status!==201) return this.$message.error("添加用户失败")
        this.$message.success("添加用户成功")
        // 隐藏添加用户对话框
        this.addDialogVisible=false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 展示编辑用户对话框
   async showEditDialog(id){
      // console.log(id)
      // 发送请求，根据ID查询用户信息
      const {data:res}=await this.$http.get("users/"+id)
      // console.log(res)
      if(res.meta.status!==200) return this.$message.error("查询用户信息失败")
      this.editForm=res.data

      this.editdialogVisible=true

    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed(){
     this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮，修改用户信息
    editUserInfo(){
        this.$refs.editFormRef.validate(async valid=>{
          // console.log(valid)
          if(!valid) return
          // 发起修改用户信息数据请求
        const {data:res}=await this.$http.put("users/"+this.editForm.id,
        {email:this.editForm.email,
        mobile:this.editForm.mobile})
        // console.log(res)
        if(res.meta.status!==200) return this.$message.error("更新用户失败")

        // 关闭对话框
        // 刷新数据列表
        // 提示修改成功
        this.editdialogVisible=false
        this.getUserList()
        this.$message.success("更新用户成功")


        })
    },
    //根据ID删除对应的信息
   async removeUserById(id){
      // console.log(id)
      // 弹框询问用户是否删除数据
     const confirmRuselt=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error=>{
          return error
        })
        // console.log(confirmRuselt)

        // 如果用户确认了删除，则返回值为字符串confirm
        // 如果用户取消了删除，则返回值为字符串cancel

        if(confirmRuselt!=="confirm") return this.$message.info("已取消删除")

          //  console.log("已删除")
          const {data:res}=await this.$http.delete("users/"+id)
          // console.log(res)
          if(res.meta.status!==200) return this.$message.error("删除用户失败")
          this.$message.success("删除用户成功")
          this.getUserList()

    },
    //展示分配角色的对话框 
   async setRole(userInfo){
      this.userInfo=userInfo

      // 在展示对话框之前，获取所有角色列表
      const {data:res}=await this.$http.get("roles")
      // console.log(res)
      if(res.meta.status!==200) return this.$message.error("获取角色列表失败")
      this.roleslist=res.data 

      this.setRoledialogVisible=true
    },
    // 点击按钮，分配角色
   async saveRoleInfo(){
     if(!this.selectedRoleId){
       return this.$message.error("请选择要分配的角色")
     }

     const {data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
       console.log(res)
      if(res.meta.status!==200) return this.$message.error("更新角色失败")

      this.$message.success("更新角色成功")
      this.getUserList()
      this.setRoledialogVisible=false

    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed(){
      this.selectedRoleId=''
      this.userInfo={}
    }
      
    
    }  

}
</script>
<style lang="less" scoped>

</style>


