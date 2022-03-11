var express = require('express')
var swig = require('swig')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var Cookies = require('cookies')
var User = require('./models/User')

var app = express()
// 配置应用模板
//定义当前应用使用的模板引擎。第一个参数：模板引擎的名称，同时也是模板文件的后缀；第二个参数：用于处理模板内容的方法
app.engine('html', swig.renderFile)
//设置模板存放目录，第一个参数必须是views，第二个参数是目录
app.set('views', './views')
//注册所使用的模板引擎。第一个参数为view engine；第二个参数和模板引擎一致
app.set('view engine', 'html')
// 开发过程，取消模板缓存
swig.setDefaults({ cache: false })

// 静态资源文件处理
app.use('/public', express.static(__dirname + '/public'))

// body-parser设置
app.use(bodyParser.urlencoded({ extended: true }))

// 设置cookie
app.use((req, res, next) => {
  req.cookies = new Cookies(req, res)
  req.userInfo = {}

  if (req.cookies.get('userInfo')) {
    try {
      req.userInfo = JSON.parse(req.cookies.get('userInfo'))

      // 获取当前登录用户的类型
      User.findById(req.userInfo._id).then((userInfo) => {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
        next()
      })
    } catch (e) {
      next()
    }
  } else {
    next()
  }
})

// 模块划分
app.use('/', require('./routers/main'))
app.use('/api', require('./routers/api'))
app.use('/admin', require('./routers/admin'))

// 连接数据库
mongoose.connect('mongodb://falcon:falcon@127.0.0.1:27017/admin', (err) => {
  if (err) {
    console.log('数据库链接失败')
  } else {
    console.log('数据库连接成功')
    app.listen(8080)
  }
})
