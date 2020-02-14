const mongoose = require('mongoose')

const articleSchema = mongoose.Schema({
    title: String,
    description: String,
    urlToImage: String,
    token: String
})

const articleModel = mongoose.model('articles', articleSchema)

module.exports = articleModel