const Article = require('mongoose').model('Article');
const User = require('mongoose').model('User');

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

        articleArgs.author = req.user.id;
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

            res.render('article/details', article);
        })
    },

    editGet: (req, res) => {
        let id = req.params.id;
        Article.findById(id).then(article => {
            if ( req.user && ( req.user.isAdmin || req.user.isAuthor(article))) {

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
            if (req.user === undefined || !(req.user.isAuthor(article))) {
                res.render('home/index', {error: 'You cannot edit this article!'});
                return;
            }
            res.render('article/delete', article);
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
                        res.render('home/index', {error: 'You cannot edit this article!'});
                        return;
                    }
                    res.redirect('/')
                }
            });
        });
    }
};