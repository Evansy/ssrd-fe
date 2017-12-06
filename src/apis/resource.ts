/*
 * 基于RESTFUL封装ajax
 */
import ajax from "utils/ajax";
import { assign } from "utils/extends";
import { Model } from "./baseModel";
import { AxiosPromise, AxiosInstance } from "axios";

let _methodMap: { [x: string]: any } = {
    list: ajax.Axios.get,
    retrieve: ajax.Axios.get,
    create: ajax.Axios.post,
    update: ajax.Axios.put,
    destroy: ajax.Axios.delete
};

function isInArray(array: Array<any>, key: any): Boolean {
    return array.indexOf(key) > -1;
}

interface Payload {
    [key: string]: any;
}

interface Table {
    search: string;
    pageIndex: number;
    pageSize: number;
    RecordCount: number;
    Records: Array<any>;
    [key: string]: any;
}

interface Rules {
    [key: string]: Array<any>;
}

export class Resource<T extends Model> {
    private _pathArgv: Array<string> = [];

    public errors: { [x: string]: string } = {};
    public t: Table = {
        search: "",
        pageIndex: 1,
        pageSize: 10,
        RecordCount: 0,
        Records: []
    };
    private cached: { [key: string]: any } = {}; //用于存储缓存的结果
    /**
     *
     * @param url rest对应的url
     * @param m  rest对应资源的model,用于存储单条资源的数据
     * @param rules 校验规则，用于form表单
     * @param cache 用于判断是否缓存结果,当资源为静态资源，没有搜索、分页等动态条件时打开
     */
    constructor(
        private url: string,
        public m: T,
        public rules: Rules = {},
        private cache: Boolean = false
    ) {
        if (m) {
            this.m.init();
        }
        this.errors = m ? m.errors : {};
        let matched = url.match(/:(\w+)/g);
        if (matched) {
            this._pathArgv = (<Array<string>>matched).map(x => {
                return x;
            });
        }
        // 把model中的值默认放到table中去，用于调用list方法时传参
        this.t = {
            ...this.t,
            ...this.m
                .clone()
                .reset()
                .serialize()
        };
    }

    /**
     * @说明 当请求为post、put的时候，默认把model中的值放到FormData里
     *
     * @参数 body: 请求的body
     */
    formData(data: Payload): Payload {
        Object.keys(data).forEach(x => {
            let obj = data[x];
            if (obj) {
                // 当上传多个文件时，逐个把文件append进FormData
                if (obj.constructor === Array && obj.length && obj[0].url) {
                    let files: Array<any> = new Array();
                    obj.forEach((file: any) => {
                        files.push(file);
                    });
                    obj = files;
                }
            }
        });
        return data;
    }

    /**
     * @说明
     *
     * @参数 body 请求body
     * @参数 config request配置
     * @参数 action 请求方法
     */
    request(body: Payload, config: Payload, action: string): AxiosPromise {
        let method = _methodMap[action];
        let response: AxiosPromise;
        let id: string;
        let value: string;
        let url = this.url;

        // @brief 替换url中的 /:{var}参数，以及当action为update，destroy, retrieve时，如果body中有{id},则把{id}放到拼接到url中
        this._pathArgv.forEach((x: string) => {
            // eg: x = :projectId
            ({ [x.slice(1)]: value, ...body } = body);
            url = url.replace(x, value);
        });
        // 标准rest接口中retrieve, update,  delete 方法path中都带有id
        // 若是非标准rest接口则不带id
        if (!isInArray(["list", "create"], action)) {
            ({ id, ...body } = body);
            if (id) {
                url = url + "/" + id;
            }
        }

        if (this.cache && this.cached[action]) {
            return this.cached[action];
        }

        // retrieve, list方法 为GET方法
        body = isInArray(["retrieve", "list"], action) ? { params: body } : this.formData(body);
        response = method(url, body, config);

        // 把上一次请求产生的错误清除
        Object.keys(this.errors).forEach(x => {
            this.errors[x] = "";
        });

        response.catch((error: Payload) => {
            if (error && error.errors) {
                Object.keys(error.errors).forEach(x => {
                    let err = error.errors[x];
                    this.errors[err.name] = err.value;
                });
            }
        });
        // 但使用get请求时，把结果给缓存了，但使用post put请求时，把缓存的结果清空
        if (this.cache && "list" === action) {
            this.cached[action] = response;
        } else {
            this.cached = {};
        }
        return response;
    }

    list(params: Payload = {}, config: Payload = {}): Payload {
        // 默认把this.t里的search, pageIndex, pageSize以及来自model的值作为参数传到list方法里
        Object.keys(this.t).forEach((x: string) => {
            if (this.t[x] && !isInArray(["Records", "RecordCount"], x)) {
                params[x] = this.t[x];
            }
        });

        return this.request(params, config, "list").then((r: Payload) => {
            this.t.RecordCount = r["RecordCount"];
            this.t.Records = r["Records"];
            return r;
        });
    }
    // 获取单个资源
    retrieve(params: Payload = {}, config: Payload = {}): Payload {
        return this.request(params, config, "retrieve").then((r: Payload) => {
            this.m.populate(r);
            return r;
        });
    }

    // 创建单个资源
    create(body: Payload = {}, config: Payload = {}): AxiosPromise {
        return this.request(body, config, "create");
    }

    // 更新单个资源
    update(body: Payload = {}, config: Payload = {}): AxiosPromise {
        return this.request(body, config, "update");
    }

    // 删除单个资源
    destroy(body: Payload, config: Payload = {}): AxiosPromise {
        return this.request(body, config, "destroy");
    }
}
