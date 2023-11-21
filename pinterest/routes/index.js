var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/createuser', async function (req, res, next) {
  const createdUser = await userModel.create({
    username: "mrunal",
    password: "Deadpool",
    posts: [],
    email: "mrunaldange618@gmail.com",
    fullName: "mrunal Vijayrao Dange"
  });

  res.send(createdUser);
});

router.get('/createpost', async function (req, res, next) {
  const createdPost = await postModel.create({
    postText: "Hello everyone !",
    user: "655cf5c58a1e8e1c8193af51"
  });

  res.send(createdPost);
});

module.exports = router;