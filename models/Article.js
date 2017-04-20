const mongoose = require('mongoose');
const ObjectId=mongoose.Schema.Types.ObjectId;

let articleSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    views:{type:Number},
    date: {type: Date, default: Date.now()},
    comments: { type: Array, default:[] }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
