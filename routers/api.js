var express = require('express')
var router = express.Router()
var User = require('../models/User')
var Category = require('../models/Category')

/**
 * 用户注册逻辑
 */
router.post('/user/register', (req, res, next) => {
  var username = req.body.username
  var password = req.body.password
  var repassword = req.body.repassword
  var isAdmin = Boolean(req.body.isAdmin)

  if (username === '') {
    res.render('error', {
      message: '用户名不能为空',
    })
    return
  }

  if (password === '') {
    res.render('error', {
      message: '密码不能为空',
    })
    return
  }

  if (password !== repassword) {
    res.render('error', {
      message: '两次输入的密码不一致',
    })
    return
  }

  User.findOne({ username: username })
    .then((userInfo) => {
      if (userInfo) {
        res.render('error', {
          message: '该用户已存在',
        })
        return
      }

      var user = new User({
        username: username,
        password: password,
        isAdmin: isAdmin,
      })
      user.save()
    })
    .then((newUserInfo) => {
      res.render('success', {
        message: '注册成功',
        url: '/api/user/login',
      })
      return
    })
})

/**
 * 用户登录逻辑
 */
router.post('/user/login', (req, res, next) => {
  var username = req.body.username
  var password = req.body.password

  if (username === '' || password === '') {
    res.render('error', {
      message: '用户名或密码不能为空',
    })
    return
  }

  User.findOne({ username: username, password: password }).then((userInfo) => {
    if (!userInfo) {
      res.render('error', {
        message: '用户名或密码错误',
      })
      return
    }

    req.cookies.set(
      'userInfo',
      JSON.stringify({
        _id: userInfo._id,
        username: userInfo.username,
      })
    )

    Category.find().then((categories) => {
      res.render('main/content', {
        userInfo: userInfo,
        categories: categories,
      })
    })
  })
})

/**
 * 用户注册
 */
router.get('/user/register', (req, res, next) => {
  res.render('api/register')
})

/**
 * 用户登录
 */
router.get('/user/login', (req, res, next) => {
  res.render('api/login')
})

/**
 * 退出登录
 */
router.get('/user/logout', function (req, res) {
  req.cookies.set('userInfo', null)
  res.render('api/login')
})

module.exports = router
