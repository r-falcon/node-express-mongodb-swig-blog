var mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  // 关联字段-分类
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  // 关联字段-作者
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // 添加时间
  addTime: {
    type: Date,
    default: new Date(),
  },

  // 阅读量
  views: {
    type: Number,
    default: 0,
  },

  // 文章标题
  title: String,

  // 文章描述
  description: {
    type: String,
    default: '',
  },

  // 文章内容
  content: {
    type: String,
    default: '',
  },

  // 文章评论
  comments: {
    type: Array,
    default: [],
  },
})
