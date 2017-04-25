const userController = require('./../controllers/user');
const articleController = require('./../controllers/article');
const homeController = require('./../controllers/home');

module.exports = (app) => {
    app.get('/', homeController.index);

    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/user/logout', userController.logout);

    app.get('/user/details', userController.userDetails);

    app.get('/article/create', articleController.createGet);
    app.post('/article/create', articleController.createPost);

    app.get('/article/details/:id', articleController.details);

    app.get('/article/edit/:id', articleController.editGet);
    app.post('/article/edit/:id', articleController.editPost);

    app.get('/article/delete/:id', articleController.deleteGet);
    app.post('/article/delete/:id', articleController.deletePost);

    app.post('/article/createComment/:id', articleController.createCommentPost);

    app.get('/cats', articleController.viewCategoryPosts);
    app.get('/dogs', articleController.viewCategoryPosts);
    app.get('/mouses', articleController.viewCategoryPosts);
    app.get('/hedgehogs', articleController.viewCategoryPosts);
    app.get('/no-category', articleController.viewCategoryPosts);



};

