var express = require('express')
var router = express.Router()
var Category = require('../models/Category')
var Content = require('../models/Content')

/**
 * 服务启动首页
 */
router.get('/', (req, res, next) => {
  res.render('home')
})

/**
 * 主页内容首页
 */
router.get('/content', (req, res, next) => {
  var id = req.query.id || ''

  if (id) {
    var data = {
      userInfo: req.userInfo,
      categories: [],
      count: 0,
      page: Number(req.query.page || 1),
      limit: 2,
      pages: 0,
    }

    Category.find()
      .then((categories) => {
        data.categories = categories
        return Content.count()
      })
      .then((count) => {
        data.count = count
        data.pages = Math.ceil(data.count / data.limit)
        data.page = Math.min(data.page, data.pages)
        data.page = Math.max(data.page, 1)
        var skip = (data.page - 1) * data.limit
        return Content.find({
          category: id,
        })
          .limit(data.limit)
          .skip(skip)
          .populate(['category', 'user'])
          .sort({
            addTime: -1,
          })
          .then((contents) => {
            data.contents = contents
            res.render('main/content', {
              id: id,
              userInfo: data.userInfo,
              categories: data.categories,
              count: data.count,
              pages: data.pages,
              page: data.page,
              limit: data.limit,
              contents: data.contents,
            })
          })
      })
  } else {
    Category.find().then((categories) => {
      res.render('main/content', {
        userInfo: req.userInfo,
        categories: categories,
      })
    })
  }
})

/**
 * 阅读全文
 */
router.get('/view', (req, res, next) => {
  var id = req.query.id || ''
  Category.find().then((categories) => {
    Content.findOne({ _id: id })
      .populate(['category', 'user'])
      .then((content) => {
        content.views++
        content.save()
        res.render('main/view', {
          userInfo: req.userInfo,
          categories: categories,
          content: content,
        })
      })
  })
})

module.exports = router
