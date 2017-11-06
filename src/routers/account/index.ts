/**
 * 个人中心相关路由
 */
const index = (r: any) =>
  require.ensure([], () => r(require("pages/account/index")), "account");

import manager from "./manager";
import project from "./project";

export default {
  path: "/user",
  // name: 'views',
  component: index,
  redirect: "/account",
  children: [...manager, ...project]
};
