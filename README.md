## Node+Express+MongoDB

### 初始化

- 新建文件夹
- 运行`npm init`

### 安装相关依赖

```js
npm install --save express
npm install --save cookies
npm install --save body-parser
npm install --save markdown
npm install --save mongoose
npm install --save swig
```

### 完善目录结构

- db 数据存储目录
- models 数据库模型文件目录
- public 公共文件目录
- routers 路由文件目录
- schemas 数据库结构文件目录
- views 模板视图文件目录
- app.js 入口文件

### 创建服务器并监听相关端口,app.js

### swig 模板配置，app.js

### 静态资源处理，app.js

### 模块划分。前台模块、api 模块、后台管理模块。app.js

- main 模块

  - / 首页
  - /view 内容页

- api 模块

  - / 首页
  - /register 用户注册
  - /login 用户登录
  - /comment 获取评论
  - /comment/post 评论提交

- 后台管理系统页

  - admin 模块
    - / 首页
  - 用户管理
    - /user 用户列表
  - 分类管理
    - /catagory 分类列表
    - /catagory/add 分类添加
    - /catagory/edit 分类修改
    - /catagory/delete 分类删除
  - 文章内容管理
    - /article 内容列表
    - /article/add 内容添加
    - /article/edit 内容修改
    - /aticle/delete 内容删除
  - 评论内容管理
    - /comment 评论列表
    - /comment/delete 评论删除

### 连接数据库,app.js

### 实现用户的注册和登录

- 加载`body-parser`处理 post 提交过来的数据，app.js
- 利用`cookies`存储登录状态，app.js,根据 isAdmin 判断是否可以进入管理后台

### 实现管理后台功能

- 用户管理，用户列表（分页）
