var express = require('express');
var router = express.Router();
const userModel = require("./users");
const passport = require('passport');

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get("/login", function (req, res) {
    res.render('login');
});

router.get("/feed", function (req, res) {
    res.render('feed');
});

router.get("/profile", isLoggedIn, function (req, res, next) {
    res.render("profile");
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