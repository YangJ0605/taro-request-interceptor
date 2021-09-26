import Request from "../utils/reqeust";

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

request({ url: "xxxxx" })
  .then(res => {
    console.log("resss", res);
  })
  .catch(err => {
    console.log(err);
  });
