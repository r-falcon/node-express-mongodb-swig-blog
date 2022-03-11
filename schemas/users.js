var mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  // 账号
  username: String,

  // 密码
  password: String,

  // 是否管理员
  isAdmin: {
    type: Boolean,
    default: false,
  },
})
