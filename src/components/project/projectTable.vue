<template lang="pug">
    div
        el-input(v-show="show.search" placeholder="请输入要搜索的项目名称" suffix-icon="el-icon-search" v-model="Project.t.search" @change="Project.list()")
        el-table.mt10(:data="Project.t.Records" stripe highlight-current-row @row-click="rowClick" style="width: 100%")
            el-table-column(property="name" label="名称")
            el-table-column(property="type" label="项目类型")
            el-table-column(property="events" label="事项")
            el-table-column(label="操作")
                template(slot-scope="scope")
                    el-tooltip.item(effect="light" content="授权项目并生成授权码" placement="top")
                        el-button(size="mini" @click="handleDialog(scope.row, 'auth')") 授权
                    el-tooltip.item(effect="light" content="项目签字并上传签字文件" placement="top")
                        el-button(size="mini" @click="handleDialog(scope.row, 'sign')") 签字
                    el-tooltip.item(effect="light" content="申请售后服务" placement="top")
                        router-link(:to="{name: 'home'}")
                            el-button(size="mini") 售后申请
                    el-tooltip.item(effect="light" content="审批或者驳回项目" placement="top")
                        el-button(size="mini" @click="handleDialog(scope.row, 'audit')") 审核
                    el-tooltip.item(effect="light" content="申请协助并留下协助记录" placement="top")
                        el-button(size="mini" @click="handleDialog(scope.row, 'assist')") 协助申请
                    el-tooltip.item(effect="light" content="记录每天的工作情况" placement="top")
                        el-button(size="mini" @click="handleDialog(scope.row, 'jobJournal')") 工作日志
                    el-tooltip.item(effect="light" content="上传设计文件并报价" placement="top")
                        el-button(size="mini" @click="handleDialog(scope.row, 'design')") 设计/报价
                    el-tooltip.item(effect="light" content="发货并上传缺货清单" placement="top")
                        el-button(size="mini" @click="handleDialog(scope.row, 'delivery')") 发货
        el-pagination.mt5(v-show="show.pagination" @current-change="Project.list" :page-size="Project.t.pageSize" layout="prev, pager, next, jumper" :total="Project.t.PageCount" :current-page.sync="Project.t.pageIndex")

        el-dialog(title="项目授权" :visible.sync="dialog.auth")
            el-form(ref="AuthForm" :model="AuthorizeCode.m" :rules="AuthorizeCode.rules" label-width="120px" label-position="right")
                el-form-item(label="项目名称")
                    p 项目名称 {{Project.m.name}}
                el-form-item(label="授权码名称" prop="name" :error="AuthorizeCode.errors.name")
                    el-input(v-model="AuthorizeCode.m.name" auto-complete="off")
            el-button(@click="dialog.auth = false") 取消
            el-button(type="primary" @click="handleAuth") 确定

        el-dialog(title="项目签字" :visible.sync="dialog.sign")
            el-form(ref="SignForm" :model="ProjectLog.m" :rules="ProjectLog.rules" label-width="120px" label-position="right")
                el-form-item(label="项目名称")
                    p 项目名称 {{Project.m.name}}
                el-form-item(label="签字文件" prop="attatchment" :error="ProjectLog.errors.attatchment")
                    el-upload(class="upload-demo" multiple :on-change="handleChange" :file-list="ProjectLog.m.attatchment" action="uploadUrl" :auto-upload="false")
                        el-button(size="small" type="primary") 点击上传
                        div(slot="tip" class="el-upload__tip") 只能上传jpg/png文件，且不超过500kb
            el-button(@click="dialog.sign = false") 取消
            el-button(type="primary" @click="handleSign") 确定
            
        el-dialog(title="项目审核" :visible.sync="dialog.audit")
            el-form(ref="AuditForm" :model="audit.data" :rules="audit.rules" label-width="120px" label-position="right")
                el-form-item(label="项目名称")
                    p 项目名称 {{Project.m.name}}
                el-form-item(label="审核内容" prop="content" :error="audit.errors.content")
                    el-input(v-model="audit.data.content" auto-complete="off" type="textarea")
            el-button(@click="dialog.audit = false") 取消
            el-button(@click="dialog.audit = false") 驳回
            el-button(type="primary" @click="handleSign") 通过

        el-dialog(title="协助申请" :visible.sync="dialog.assist")
            el-form(ref="AssistForm" :model="assist.data" :rules="assist.rules" label-width="120px" label-position="right")
                el-form-item(label="项目名称")
                    p 项目名称 {{Project.m.name}}
                el-form-item(label="协助内容" prop="content" :error="assist.errors.content")
                    el-input(v-model="assist.data.content" auto-complete="off" type="textarea")
            el-button(@click="dialog.assist = false") 取消
            el-button(type="primary" @click="handleAssist") 确认

        el-dialog(title="工作日志" :visible.sync="dialog.jobJournal")
            el-form(ref="JobJournalForm" :model="jobJournal.data" :rules="jobJournal.rules" label-width="120px" label-position="right")
                el-form-item(label="项目名称")
                    p 项目名称 {{Project.m.name}}
                el-form-item(label="工作日期")
                    el-col(:span="11")
                        el-date-picker(type="date" placeholder="选择日期" v-model="jobJournal.data.date" style="width: 100%;")
                el-form-item(label="工作内容" prop="content" :error="jobJournal.errors.content")
                    el-input(v-model="jobJournal.data.content" auto-complete="off" type="textarea")
                el-form-item(label="照片类型")
                    el-cascader(:options="jobJournal.data.options" v-model="jobJournal.data.type")
                el-form-item(label="工作照片" prop="attatchment" :error="jobJournal.errors.attatchment")
                    el-upload(class="upload-demo" multiple :on-change="handleChange" :file-list="jobJournal.data.attatchment" action="uploadUrl" :auto-upload="false")
                        el-button(size="small" type="primary") 点击上传
                        div(slot="tip" class="el-upload__tip") 只能上传jpg/png文件，且不超过500kb
            el-button(@click="dialog.jobJournal = false") 取消
            el-button(type="primary" @click="handleJobJournal") 确认

        el-dialog(title="上传设计文件及报价" :visible.sync="dialog.design")
            el-form(ref="DesignForm" :model="design.data" :rules="design.rules" label-width="120px" label-position="right")
                el-form-item(label="项目名称")
                    p 项目名称 {{Project.m.name}}
                el-form-item(label="报价" prop="price" :error="design.errors.price")
                    el-input(v-model="jobJournal.data.content" auto-complete="off")
                el-form-item(label="设计文件" prop="attatchment" :error="design.errors.attatchment")
                    el-upload(class="upload-demo" multiple :on-change="handleChange" :file-list="design.data.attatchment" action="uploadUrl" :auto-upload="false")
                        el-button(size="small" type="primary") 点击上传
                        div(slot="tip" class="el-upload__tip") 只能上传jpg/png文件，且不超过500kb
            el-button(@click="dialog.design = false") 取消
            el-button(type="primary" @click="handleJobJournal") 确认

        el-dialog(title="项目发货记录" :visible.sync="dialog.delivery")
            el-form(ref="DeliveryForm" :model="delivery.data" :rules="delivery.rules" label-width="120px" label-position="right")
                el-form-item(label="项目名称")
                    p 项目名称 {{Project.m.name}}
                el-form-item(label="缺货清单" prop="number" :error="delivery.errors.number")
                    div
                        p 共计缺货
                        el-input-number(v-model="design.data.number" controls-position="right" :min="1")
                        p 项
                el-form-item(label="缺货清单文件" prop="attatchment" :error="delivery.errors.attatchment")
                    el-upload(class="upload-demo" multiple :on-change="handleChange" :file-list="delivery.data.attatchment" action="uploadUrl" :auto-upload="false")
                        el-button(size="small" type="primary") 点击上传
                        div(slot="tip" class="el-upload__tip") 只能上传jpg/png文件，且不超过500kb
            el-button(@click="dialog.delivery = false") 取消
            el-button(type="primary" @click="handleDelivery") 确认
</template>

<script>
import  { Project, AuthorizeCode, ProjectLog } from 'apis';
import { data } from './data';
export default {
    name: 'projectTable',
    data () {
        return {
            ...data,
            Project: Project,
            uploadUrl: '',
            ProjectLog: ProjectLog,
            AuthorizeCode: AuthorizeCode,
            dialog: {auth: false, sign: false, afterSale: false, audit: false, assist: false, jobJournal: false, design: false, delivery: false}
        };
    },
    props: {
        show: {
            search: false,
            pagination: false
        }
    },
    created () {
        Project.list();
    },
    methods: {
        rowClick (m) {
        },
        clickTab (tab, event) {
            Project.list();
        },
        handleAuth () {
            this.$refs.AuthForm.validate(v => {
                if (v) {
                    this.dialog.auth = false;
                    AuthorizeCode.create({name: AuthorizeCode.m.name, projectId: Project.m.id}).then(r => {
                        this.$message({
                            message: '授权成功',
                            type: 'success'
                        });
                    });
                };
            });
        },
        handleSign () {
            this.$refs.SignForm.validate(v => {
                if (v) {
                    this.dialog.sign = false;
                    AuthorizeCode.create({name: AuthorizeCode.m.name, projectId: Project.m.id}).then(r => {
                        this.$message({
                            message: '签字成功',
                            type: 'success'
                        });
                    });
                };
            });
        },
        handleAssist () {
            this.$refs.AssistForm.validate(v => {
                if (v) {
                    this.dialog.assist = false;
                    AuthorizeCode.create({name: AuthorizeCode.m.name, projectId: Project.m.id}).then(r => {
                        this.$message({
                            message: '签字成功',
                            type: 'success'
                        });
                    });
                };
            });
        },
        handleJobJournal () {
            this.$refs.JobJournalForm.validate(v => {
                if (v) {
                    this.dialog.jobJournal = false;
                    AuthorizeCode.create({name: AuthorizeCode.m.name, projectId: Project.m.id}).then(r => {
                        this.$message({
                            message: '签字成功',
                            type: 'success'
                        });
                    });
                };
            });
        },
        handleDesign () {
            this.$refs.DesignForm.validate(v => {
                if (v) {
                    this.dialog.desgin = false;
                    AuthorizeCode.create({name: AuthorizeCode.m.name, projectId: Project.m.id}).then(r => {
                        this.$message({
                            message: '签字成功',
                            type: 'success'
                        });
                    });
                };
            });
        },
        handleDelivery () {
            this.$refs.DeliveryForm.validate(v => {
                if (v) {
                    this.dialog.delivery = false;
                    AuthorizeCode.create({name: AuthorizeCode.m.name, projectId: Project.m.id}).then(r => {
                        this.$message({
                            message: '签字成功',
                            type: 'success'
                        });
                    });
                };
            });
        },
        handleAfterSave () {
        },
        handleDialog (row, dialog) {
            this.dialog[dialog] = true;
            Project.m = row;
        },
        handleChange (file, fileList) {
            ProjectLog.m.attatchment = fileList;
        }
    }
};
</script>
