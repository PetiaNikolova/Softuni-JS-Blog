const Article = require('mongoose').model('Article');
const User = require('mongoose').model('User');
const dateFormat = require('dateformat');


function validateArticles(articleArgs, req) {
    let errorMsg = '';
    if (!req.isAuthenticated()) {
        errorMsg = 'You should be logged in to operate with articles!'
    } else if (!articleArgs.title) {
        errorMsg = 'Invalid title!';
    } else if (!articleArgs.content) {
        errorMsg = 'Invalid content!';
    }
    return errorMsg;
}

module.exports = {
    createGet: (req, res) => {
        res.render('article/create');
    },

    createPost: (req, res) => {
        let articleArgs = req.body;

        let errorMsg = validateArticles(articleArgs, req);

        if (errorMsg) {
            res.render('article/create', {error: errorMsg});
            return;
        }

        let image=req.files.image;

        if(image){
            let fileName=image.name;
            image.mv(`./public/images/${fileName}`, err=>{
                if(err) {
                    console.log(err.message);
                }
            });
            articleArgs.imagePath=`/images/${image.name}`;
        }

        articleArgs.author = req.user.id;



        articleArgs.views = 0;
        Article.create(articleArgs).then(article => {
            req.user.articles.push(article.id);
            req.user.save(err => {
                if (err) {
                    res.redirect('/', {error: err.message});
                } else {
                    res.redirect('/');
                }
            })
        })
    },

    details: (req, res) => {
        let id = req.params.id;

        Article.findById(id).populate('author').then(article => {

            Article.update({_id: id}, {$set: {views: article.views + 1}})
                .then(updateStatus => {
                    article.formatedDate = dateFormat(article.date, "dd-mm-yyyy HH:mm");

                    res.render('article/details', article);
                });

        });

    },

    editGet: (req, res) => {
        let id = req.params.id;
        Article.findById(id).then(article => {
            if (req.user && ( req.user.isAdmin || req.user.isAuthor(article))) {

                res.render('article/edit', article);
            }
            else {
                res.render('home/index', {error: 'You cannot edit this article!'});
            }

        });
    },

    editPost: (req, res) => {
        let id = req.params.id;
        let articleArgs = req.body;

        let errorMsg = validateArticles(articleArgs, req);

        if (errorMsg) {

            res.render('article/edit', {
                error: errorMsg
            });
            return;
        } else {
            Article.findById(id).then(article => {
                if (req.user === undefined || !(req.user.isAuthor(article))) {
                    res.render('home/index', {error: 'You cannot edit this article!'});
                    return;
                }
            });
            Article.update({_id: id}, {$set: {title: articleArgs.title, content: articleArgs.content}})
                .then(updateStatus => {
                    res.redirect(`/article/details/${id}`)
                });
        }
    }
    ,

    deleteGet: (req, res) => {
        let id = req.params.id;
        Article.findById(id).then(article => {
            if (req.user && ( req.user.isAdmin || req.user.isAuthor(article))) {

                res.render('article/delete', article);
            }
            else {
                res.render('home/index', {error: 'You cannot delete this article!'});
            }

        });
    },

    deletePost: (req, res) => {
        let id = req.params.id;
        Article.findByIdAndRemove(id).then(article => {
            let index = req.user.articles.indexOf(article.id);
            req.user.articles.splice(index, 1);
            req.user.save(err => {
                if (err) {
                    res.redirect('/', {error: err.message});
                } else {
                    if (req.user === undefined || !(req.user.isAuthor(article))) {
                        res.render('home/index', {error: 'You cannot delete this article!'});
                        return;
                    }
                    res.redirect('/')
                }
            });
        });
    },

    createCommentPost: (req, res) => {

        let id = req.params.id;
        let comment = req.body.comment;
        let user = req.user.id;
        let comments = [];

        Article.findById(id).then(article => {
            if (req.user === undefined) {
                res.render('home/index', {error: 'You cannot post comments!'});
                return;
            }

            comments = article.comments;

            User.findOne({_id: user}).then(user => {
                comments.push({user: user.fullName, comment: comment});

                Article.update({_id: id}, {$set: {comments: comments}})
                    .then(updateStatus => {
                        res.redirect(`/article/details/${id}`)
                    });
            });
        });
    },

    viewCategoryPosts: (req, res) => {
        let categoryName = req.originalUrl.substring(1);

        Article.find({category:categoryName}).then(articles => {
            res.render('home/index',{articles: articles});
        })


    }

};