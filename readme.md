#### 基于tarojs封装类似axios的请求响应拦截器

```js

import Taro from "@tarojs/taro";

type RequestOption<T=any> = Taro.request.Option<T> & Record<string, any>;
type ResponseData = Taro.request.SuccessCallbackResult & Record<string, any>;
type RequestResolveFn = (option: RequestOption ) => void;
type RequestRejectFn = (err: any) => void;

type ResponseResolveFn = (option: ResponseData) => void;
type ResponseRejectFn = (err: any) => void;

type RequestInterceptor = {
  resolve: RequestResolveFn;
  reject: RequestRejectFn;
} | null;

type ResponseInterceptor = {
  resolve: ResponseResolveFn;
  reject: ResponseRejectFn;
} | null;

class InterceptorRequest {
  private requestInterceptors: RequestInterceptor[];
  private responseInterceptors: ResponseInterceptor[];

  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.request = this.request.bind(this)
    this.addResponseInterceptor = this.addResponseInterceptor.bind(this)
    this.addRequestInterceptor = this.addRequestInterceptor.bind(this)
    this.removeRequestInterceptor = this.removeRequestInterceptor.bind(this)
    this.removeResponseInterceptor = this.removeResponseInterceptor.bind(this)
  }
  addRequestInterceptor(
    resolveFn: RequestResolveFn,
    rejectFn: RequestRejectFn
  ) {
    this.requestInterceptors.push({
      resolve: resolveFn,
      reject: rejectFn
    });
    return this.requestInterceptors.length - 1;
  }

  removeRequestInterceptor(id: number) {
    this.requestInterceptors[id] = null;
  }

  addResponseInterceptor(
    resolveFn: ResponseResolveFn,
    rejectFn: ResponseRejectFn
  ) {
    this.responseInterceptors.push({
      resolve: resolveFn,
      reject: rejectFn
    });
    return this.responseInterceptors.length - 1;
  }

  removeResponseInterceptor(id: number) {
    this.responseInterceptors[id] = null;
  }

  request(option: RequestOption) {
    const chain = [];
    this.requestInterceptors.forEach(item => {
      chain.unshift(item?.resolve, item?.reject);
    });
    const realRequest = [Taro.request, undefined];
    chain.push(...realRequest);
    this.responseInterceptors.forEach(item => {
      chain.push(item?.resolve, item?.reject);
    });
    let promise = Promise.resolve(option);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }
    return promise;
  }
}

export default InterceptorRequest;


```


##### 调用示范

```js

const baseRequest = new Request();

baseRequest.addRequestInterceptor(
  config => {
    config.header = {
      name: "cc"
    };
    return config;
  },
  err => console.log(err)
);

baseRequest.addResponseInterceptor(
  res => {
    console.log("data", res.data);
    return res.data;
  },
  err => console.log(err)
);

const { request } = baseRequest;

export default request;

```


```js
import request from 'base-request'

request({ url: "xxxxx" })
  .then(res => {
    console.log("resss", res);
  })
  .catch(err => {
    console.log(err);
  });



```