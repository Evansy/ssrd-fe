<template lang="pug">
    .login-content
        el-form.demo-loginForm.login-container(:model='Register.m' :rules='Register.rules' ref='RegisterForm' label-position='left' label-width='0px')
            h3.title 系统注册
            el-form-item(prop='username' :error='Register.errors.username')
                el-input(type='text' v-model='Register.m.username' auto-complete='off' placeholder='用户名')
            el-form-item(prop='email' :error='Register.errors.email')
                el-input(type='text' v-model='Register.m.email' auto-complete='off' placeholder='邮箱')
            el-form-item(prop='role')
                el-select(v-model='Register.m.role' placeholder='请选择客户类型' style='width:100%;')
                    el-option(v-for="role in roles" :key="role.value" :label="role.name" :value="role.value")
            el-form-item(prop='password' :error='Register.errors.password')
                el-input(type='password' v-model='Register.m.password' auto-complete='off' placeholder='密码')
            el-button(type='primary' style='width:100%;' @click.native.prevent='RegisterSubmit' :loading='logining') 注 册
        .last-item
            a.font-black(v-for="x in $store.state.home.env" :key="x.name" :href="x.url")
                i.iconfont(:class="icons[x.name]")
</template>

<script lang="ts">
import { Component, Provide, Vue } from "vue-property-decorator";
import  { Register } from 'apis';
@Component
export default class RegisterView extends Vue
{
  @Provide() activeType: string = "index";
    @Provide() roles: Array<{name: string, value: number}> = [
        { name: '个人用户', value: 41 },
        { name: '常规用户', value: 42 },
        { name: '行业用户', value: 31 },
        { name: '分销商', value: 32 }
    ];
    @Provide() logining: Boolean = false;
    @Provide() Register: any = Register;
    @Provide() icons: {[x: string]: string} = {qq: 'icon-qq', weixin: 'icon-wechat', weibo: 'icon-weibo'};
    $refs: {
        RegisterForm: HTMLFormElement
    };
    RegisterSubmit () {
        this.$refs.RegisterForm.validate((valid: Boolean) => {
            if (valid) {
                Register.create().then(r => {
                    this.$confirm('恭喜您注册成功！', '成功', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'success'
                    });
                    this.$router.push({name: 'home'});
                }).catch((err: any) => {
                    this.$message.error(err.msg);
                });
            };
        });
    }
};
</script>

<style lang="scss">
    .login-content{
        width: 400px;
        margin: 180px auto 100px;
    }
    .login-container {
        /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        .title {
        margin: 0px auto 40px auto;
        text-align: center;
        color: #505458;
        }
        .remember {
        margin: 0px 0px 35px 0px;
        }
    }
</style>
