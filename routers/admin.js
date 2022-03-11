var express = require('express')
var router = express.Router()
var User = require('../models/User')
var Category = require('../models/Category')
var Content = require('../models/Content')

router.use((req, res, next) => {
  if (!req.userInfo.isAdmin) {
    res.send('对不起，只有管理员才可以进入后台')
    return
  }
  next()
})

/**
 * 首页
 */
router.get('/', (req, res, next) => {
  res.render('admin/index', {
    userInfo: req.userInfo,
  })
})

/**
 * 用户列表
 */
router.get('/user/userList', (req, res, next) => {
  /**
   * 分页展示：
   * 从数据库读取所有的用户数据
   * limit(Number):限制获取的数据条数
   * skip(Number):忽略数据的条数
   */

  var page = req.query.page || 1
  var limit = 2

  // 获取总条数
  User.count().then((count) => {
    var pages = Math.ceil(count / limit)
    // 当前页不能大于总页数
    page = Math.min(page, pages)
    // 当前页不能小于1
    page = Math.max(page, 1)
    var skip = (page - 1) * limit

    // 从数据库中读取所有的用户数据
    User.find()
      .limit(limit)
      .skip(skip)
      .then((users) => {
        res.render('admin/userList', {
          userInfo: req.userInfo,
          skipUrl: '/admin/user/userList',
          users: users,
          page: page,
          count: count,
          pages: pages,
          limit: limit,
        })
      })
  })
})

/**
 * 分类列表
 */
router.get('/sort/sortList', (req, res, next) => {
  var page = req.query.page || 1
  var limit = 2
  Category.count().then((count) => {
    var pages = Math.ceil(count / limit)
    page = Math.min(page, pages)
    page = Math.max(page, 1)
    var skip = (page - 1) * limit

    Category.find()
      .limit(limit)
      .skip(skip)
      .then((categories) => {
        res.render('admin/sortList', {
          userInfo: req.userInfo,
          skipUrl: '/admin/sort/sortList',
          categories: categories,
          page: page,
          count: count,
          pages: pages,
          limit: limit,
        })
      })
  })
})

/**
 * 添加分类
 */
router.get('/sort/create', (req, res, next) => {
  res.render('admin/sortAdd', {
    userInfo: req.userInfo,
  })
})

router.post('/sort/create', (req, res, next) => {
  var name = req.body.name || ''
  if (name === '') {
    res.render('error', {
      message: '分类名称不能为空',
    })
    return
  }

  Category.findOne({
    name: name,
  })
    .then((rs) => {
      if (rs) {
        res.render('error', {
          message: '该分类已存在',
        })
        return Promise.reject()
      } else {
        return new Category({
          name: name,
        }).save()
      }
    })
    .then((newCategory) => {
      res.render('success', {
        message: '分类保存成功',
        url: '/admin/sort/sortList',
      })
    })
})

/**
 * 修改分类
 */
router.get('/sort/edit', (req, res, next) => {
  var id = req.query.id || ''
  Category.findOne({ _id: id }).then((category) => {
    if (!category) {
      res.render('error', {
        message: '分类信息不存在',
      })
    } else {
      res.render('admin/sortEdit', {
        userInfo: req.userInfo,
        id: id,
        name: category.name,
      })
    }
  })
})

router.post('/sort/edit', (req, res, next) => {
  var id = req.query.id || ''
  var name = req.body.name || ''

  Category.findOne({ _id: id })
    .then((category) => {
      if (!category) {
        res.render('error', {
          message: '分类信息不存在',
        })
        return Promise.reject()
      } else {
        if (name === category.name) {
          res.render('success', {
            message: '修改成功',
            url: '/admin/sort/sortList',
          })
        } else {
          // 要修改的分类是否已存在。$ne 不等于
          Category.findOne({
            _id: { $ne: id },
            name: name,
          })
        }
      }
    })
    .then((sameCategory) => {
      if (sameCategory) {
        res.render('error', {
          message: '数据库中已存在同名分类',
        })
        return Promise.reject()
      } else {
        return Category.updateOne({ _id: id }, { name: name })
      }
    })
    .then(() => {
      res.render('success', {
        message: '修改成功',
        url: '/admin/sort/sortList',
      })
    })
})

/**
 * 删除分类
 */
router.get('/sort/delete', (req, res, next) => {
  var id = req.query.id || ''
  Category.remove({ _id: id }).then(() => {
    res.render('success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/sort/sortList',
    })
  })
})

/**
 * 文章内容列表
 */
router.get('/article/articleList', (req, res, next) => {
  var page = req.query.page || 1
  var limit = 2
  Content.count().then((count) => {
    var pages = Math.ceil(count / limit)
    page = Math.min(page, pages)
    page = Math.max(page, 1)
    var skip = (page - 1) * limit
    Content.find()
      .limit(limit)
      .skip(skip)
      .populate(['category', 'user'])
      .sort({ addTime: -1 })
      .then((contents) => {
        res.render('admin/articleList', {
          userInfo: req.userInfo,
          skipUrl: '/admin/article/articleList',
          contents: contents,
          page: page,
          count: count,
          pages: pages,
          limit: limit,
        })
      })
  })
})

/**
 * 文章内容添加
 */
router.get('/article/create', (req, res, next) => {
  Category.find()
    .sort({ _id: -1 })
    .then((categories) => {
      res.render('admin/articleAdd', {
        userInfo: req.userInfo,
        categories: categories,
      })
    })
})

router.post('/article/create', (req, res, next) => {
  if (req.body.category === '') {
    res.render('error', {
      message: '分类不能为空',
    })
    return
  }

  if (req.body.title === '') {
    res.render('error', {
      message: '标题不能为空',
    })
    return
  }

  new Content({
    category: req.body.category,
    title: req.body.title,
    user: req.userInfo._id.toString(),
    description: req.body.description,
    content: req.body.content,
  })
    .save()
    .then((rs) => {
      res.render('success', {
        message: '内容添加成功',
        url: '/admin/article/articleList',
      })
    })
})

/**
 * 文章内容修改
 */
router.get('/article/edit', (req, res, next) => {
  var id = req.query.id || ''
  var categories = []
  // sort 排序，1表示升序，-1表示降序
  Category.find()
    .sort({ _id: -1 })
    .then((rs) => {
      categories = rs
      return Content.findOne({ _id: id }).populate('category')
    })
    .then((content) => {
      if (!content) {
        res.render('error', {
          message: '文章不存在',
        })
        return Promise.reject()
      } else {
        res.render('admin/articleEdit', {
          userInfo: req.userInfo,
          categories: categories,
          content: content,
        })
      }
    })
})

router.post('/article/edit', (req, res, next) => {
  var id = req.query.id || ''
  if (req.body.category === '') {
    res.render('error', {
      message: '分类不能为空',
    })
    return
  }

  if (req.body.title === '') {
    res.render('error', {
      message: '标题不能为空',
    })
    return
  }

  Content.updateOne(
    { _id: id },
    {
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
    }
  ).then(() => {
    res.render('success', {
      message: '文章修改成功',
      url: '/admin/article/articleList',
    })
  })
})

/**
 * 文章内容删除
 */
router.get('/article/delete', (req, res, next) => {
  var id = req.query.id || ''
  Content.remove({ _id: id }).then(() => {
    res.render('success', {
      message: '删除成功',
      url: '/admin/article/articleList',
    })
  })
})

/**
 * 评论列表
 */
router.get('/comment/commentList', (req, res, next) => {
  var page = req.query.page || 1
  var limit = 1
  Content.count().then((count) => {
    var pages = Math.ceil(count / limit)
    page = Math.min(page, pages)
    page = Math.max(page, 1)
    var skip = (page - 1) * limit
    Content.find()
      .limit(limit)
      .skip(skip)
      .sort({ addTime: -1 })
      .then((contents) => {
        res.render('admin/commentList', {
          userInfo: req.userInfo,
          skipUrl: '/admin/comment/commentList',
          contents: contents,
          page: page,
          pages: pages,
          limit: limit,
        })
      })
  })
})

/**
 * 评论提交
 */
router.post('/comment/submit', (req, res, next) => {
  var contentId = req.query.id
  var postData = {
    username: req.userInfo.username,
    postTime: new Date(),
    comment: req.body.comment,
  }

  Content.findOne({ _id: contentId })
    .then((content) => {
      content.comments.push(postData)
      return content.save()
    })
    .then((newContent) => {
      res.render('success', {
        message: '评论成功',
        url: `/view?id=${newContent._id.toString()}`,
      })
    })
})

/**
 * 评论删除
 */
router.get('/comment/delete', (req, res, next) => {
  var contentId = req.query.contentId || ''
  var comment = req.query.comment || ''
  Content.findOne({ _id: contentId }).then((content) => {
    content.comments = content.comments.filter(
      (item) => item.comment !== comment
    )

    new Content(content).save().then((rs) => {
      res.render('success', {
        message: '删除成功',
        url: '/admin/comment/commentList',
      })
    })
  })
})

module.exports = router
