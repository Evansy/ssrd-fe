<template lang="pug">
    .page-header
        .header-bar
            .container.flex
                span 欢迎来到深圳市盛世润达智能科技有限公司官方网站
                span
                    router-link.user-option-item.active(v-show="!user.isAuthenticated" :to="{name: 'login'}") [ 登陆 ]
                    router-link.user-option-item(v-show="!user.isAuthenticated" :to="{name: 'register'}") [ 注册 ]
                    router-link.user-option-item(:to="{name: 'account' }") 个人中心
                    a.user-option-item(v-show="user.isAuthenticated" href="javascript: void(0);" @click='logout') 注销
                    a.user-option-item(href="javascript: void(0);") 购物车
                    a.user-option-item(href="javascript: void(0);") 快捷下单
        .container.flex.pt10.pb10
            img(src="~assets/logo-large.png")
            .div
                button.btn.btn-primary.btn-round.mr20
                    i.iconfont.icon-order
                    |  工程下单
                span.font-blue.f18
                    i.iconfont.icon-tel.f24.company-tel.mr5
                    | 0755-8218-2153
        .header-nav
            .container.flex
                nav.herder-nav-wrapper
                    router-link.header-nav-item(v-for="(item, index) in menu" :class="{active: getNavActive === index}" :key="item.title" :to="{ path: `/${item.name}` }") {{item.title}}
                .header-serch
                    i.iconfont.icon-search
                    input.header-search-input(type="text" placeholder="请输入您要搜索的内容...") 
</template>
<script lang="ts">
import { Component, Provide, Vue } from "vue-property-decorator";
import { mapGetters } from 'vuex';

@Component
export default class Header extends Vue {
    @Provide() menu = [{ name: 'home', title: '首页' },
        { name: 'system', title: '系统展示' },
        { name: 'product', title: '系统产品' },
        { name: 'product', title: '设备辅件' },
        { name: 'support', title: '服务与支持' },
        { name: 'support', title: '展会协助' },
        { name: 'about', title: '关于我们' },
        { name: 'information', title: '资讯生活' }
    ];
    @Provide() active = 0;
    @Provide() getNavActive = this.$store.state.global.navBarActive;
    @Provide() user = this.$store.state.user;
    logout () {
        this.$store.commit('logout');
    }
};
</script>
<style lang="scss">
    @import "~scss/pages/views/header";
</style>
