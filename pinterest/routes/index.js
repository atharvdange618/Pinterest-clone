var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const upload = require('./multer');
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Pinterest' });
});

router.get("/login", function (req, res) {
    res.render('login', { error: req.flash("error") });
});

router.get("/feed", async function (req, res) {
    const user = await userModel.findOne({
        username: req.session.passport.user
    });
    res.render('feed', { user });
});

router.post("/upload", isLoggedIn, upload.single('file'), async function (req, res) {
    if (!req.file) {
        return res.status(404).send("no files were given");
    }
    //save the uploaded file as a post and give it's post id to the user and user id to the post
    const user = await userModel.findOne({
        username: req.session.passport.user
    });
    const post = await postModel.create({
        image: req.file.filename,
        imageText: req.body.filecaption,
        userid: user._id
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
    const user = await userModel.findOne({
        username: req.session.passport.user
    }).populate("posts");
    // console.log(user);
    res.render("profile", { user });
});

router.post("/register", function (req, res) {
    const { username, email, fullname } = req.body;
    const userData = new userModel({ username, email, fullname });

    userModel.register(userData, req.body.password, function (err) {
        if (err) {
            console.error("Registration error:", err);
            return res.redirect("/"); // Redirect to home page in case of registration error
        }

        passport.authenticate("local", function (authErr, user) {
            if (authErr) {
                console.error("Authentication error:", authErr);
                return res.redirect("/");
            }

            req.logIn(user, function (loginErr) {
                if (loginErr) {
                    console.error("Login error:", loginErr);
                    return res.redirect("/");
                }

                res.redirect("/profile");
            });
        })(req, res);
    });
});

router.post("/login", passport.authenticate('local', {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

module.exports = router;