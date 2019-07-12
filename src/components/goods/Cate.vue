<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

          <!-- 卡片视图区域 -->
          <el-card>
              <el-row>
                  <el-col>
                      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                  </el-col>
              </el-row>


          <!-- 表格 -->
          <tree-table  class="treeTable":data="Catelist" :columns="columns" :selection-type="false" 
          :show-row-hover="false" border show-index index-text="#"
          :expand-type="false">

           <!--是否有效  -->
          <template slot="isok" slot-scope="scope">
               <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
               <i class="el-icon-error" style="color:red" v-else></i>
          </template>
         <!--排序 -->
          <template slot="order" slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
              <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
              <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
          <!--操作 -->
          <template slot="opt" slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </template>

          </tree-table>


          <!-- 分页区域 -->

          <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
        </el-pagination>

        <!-- 添加分类的对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="AddCatedialogVisible"
            width="50%" @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="AddCateForm" :rules="AddCateFormRules" ref="AddCateFormRef" label-width="100px" >
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="AddCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级名称:">
                    <!-- options是用来显示数据来源 -->
                    <!-- props用来指定配置对象 -->
                    <el-cascader 
                        v-model="selectKeys"
                        :options="parentCateList"
                        :props=" cascaderProps"
                        @change="parentCateChanged" clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="AddCatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
            </el-dialog>


          </el-card>

         
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 商品分类数据列表，默认为空
            Catelist:[],
            // 查询条件
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            // 总数据条数
            total:0,
            // 为table指定列的定义
            columns:[{
                label:"分类名称",
                prop:'cat_name'
            },{
                label:"是否有效",
                // 将当前列定义为模板列
                type:"template",
                // 表示当前这一列使用模板名称
                template:"isok"  
            },{
                label:"排序",
                // 将当前列定义为模板列
                type:"template",
                // 表示当前这一列使用模板名称
                template:"order"  
            },{
                label:"操作",
                // 将当前列定义为模板列
                type:"template",
                // 表示当前这一列使用模板名称
                template:"opt"  
            }],
            // 控制添加分类对话框的显示与隐藏
            AddCatedialogVisible:false,
            // 添加分类的数据表单对象
            AddCateForm:{
                // 将要添加分类的名称
                cat_name:'',
                // 父级分类ID
                cat_pid:0,
                // 分类的等级，默认要添加的是一级分类
                cat_level:0,
            },
            // 添加分类表单验证规则对象
            AddCateFormRules:{
                cat_name:[
                     { required: true, message: '请输入分类名称', trigger: 'blur' },
                   
                ]
            },
            // 父级分类数据列表
            parentCateList:[],
            //指定级联选择器的配置对象 
            cascaderProps:{
              expandTrigger: 'hover',
              value:'cat_id',
              label:'cat_name',
              children:'children',
            },
            // 选中的父级分类ID数组
            selectKeys:[]
        }
    },
    created(){
        this.getCatelist()

    },
    methods:{
        // 获取商品分类数据
       async getCatelist(){
        const {data:res}=await this.$http.get("categories",{params:this.queryInfo})
        // console.log(res)
        if(res.meta.status!==200) return this.$message.error("获取商品分类失败")
        // 把数据列表赋值给Catelist
         this.Catelist=res.data.result
        //  为总数据条数赋值
         this.total=res.data.total
        },
        // 监听pagesize改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize
            this.getCatelist()
        },
        // 监听pagenum改变
        handleCurrentChange(newPage){
             this.queryInfo.pagenum=newPage
             this.getCatelist()
        },
        // 点击按钮，展示添加分类对话框
        showAddCateDialog(){
            // 先获取父级分类的数据列表
            this.getParentCateList()
            //再展示对话框 
            this.AddCatedialogVisible=true
        },
       async getParentCateList(){
           const {data:res}=await this.$http.get("categories",{params:{type:2}})
           
           if(res.meta.status!==200) return this.$message.error("获取父级分类数据失败")
            // console.log(res.data)
           this.parentCateList=res.data
        //    console.log(this.parentCateList)
        },
        // 选择项发生变化触发这个函数
        parentCateChanged(){
            console.log(this.selectKeys)
            // 如果selectKeys数组中的length>0，证明选中了父级分类，反正，说明没有选中任何父级分类
            if(this.selectKeys.length>0){
                // 父级分类的ID
                this.AddCateForm.cat_pid=this.selectKeys[this.selectKeys.length-1];
                // 为当前分类等级赋值
                this.AddCateForm.cat_level=this.selectKeys.length
                return 
            }else{
                // 父级分类的ID
                this.AddCateForm.cat_pid=0;
                // 为当前分类等级赋值
                this.AddCateForm.cat_level=0
            }
            
        },
        // 点击按钮，添加新的分类
         addCate(){
             this.$refs.AddCateFormRef.validate(async valid=>{
                 if(!valid) return
             const {data:res}=await this.$http.post("categories",this.AddCateForm)
            //  console.log(res)
            if(res.meta.status!==201) return this.$message.error("添加分类失败")

             this.$message.success("添加分类成功")
              this.getCatelist()
              this.AddCatedialogVisible=false

             })
         },
        //监听对话框的关闭事件，重置表单数据
         addCateDialogClosed(){
             this.$refs.AddCateFormRef.resetFields()
             this.selectKeys=[]
             this.AddCateForm.cat_pid=0
             this.AddCateForm.cat_level=0
         }

    }
}
</script>


<style lang="less" scoped>

.treeTable{
    margin-top:15px;
}

.el-cascader{
    width:100%;
}
</style>


