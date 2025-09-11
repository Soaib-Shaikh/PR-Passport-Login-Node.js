const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const passport = require('passport');

// Check API request or browser
const isApiRequest = (req) => req.headers['content-type'] === 'application/json';

// Default route
module.exports.defaultRoute = (req, res) => {
    if (req.isAuthenticated()) {
        return isApiRequest(req)
            ? res.json({ success: true, user: req.user })
            : res.redirect('/blog');
    }
    return isApiRequest(req)
        ? res.json({ success: false, message: "Please login first" })
        : res.redirect('/login');
};

// Blog home page (All posts)
module.exports.homePageReader = async (req, res) => {
    try {
        if (!req.isAuthenticated()) return res.redirect('/login');

        // All posts (latest first)
        const posts = await Post.find()
            .populate('author', 'username avatarLocal bio')
            .populate('comments.author', 'username')
            .sort({ createdAt: -1 })
            .lean();

        // Carousel ke liye featured/latest posts (top 5)
        const featuredPosts = posts.slice(0, 5);

        // Featured author for spotlight (author of latest post)
        const latestPost = posts[0];
        const featuredAuthor = latestPost ? latestPost.author : null;

        // Popular posts (most liked)
        const popularPosts = await Post.find()
            .populate('author', 'username')
            .sort({ likes: -1 })
            .limit(5);

        // Recent comments
        const recentComments = [];
        posts.forEach(p => {
            p.comments.forEach(c => {
                recentComments.push({
                    postId: p._id,
                    postTitle: p.title,
                    username: c.author?.username || "Anonymous",
                    body: c.body,
                    createdAt: c.createdAt
                });
            });
        });
        recentComments.sort((a, b) => b.createdAt - a.createdAt);
        const latestComments = recentComments.slice(0, 5);

        res.render('./pages/blog/blogHome', {
            user: req.user,
            posts,
            featuredPosts,
            popularPosts,
            recentComments,
            featuredAuthor,
        });


    } catch (err) {
        console.error("⚠️ Blog load error:", err);
        res.status(500).send("Server Error");
    }
};


// Writer home page (User's posts only)
module.exports.homePageWriter = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return isApiRequest(req)
                ? res.json({ success: false, message: "Unauthorized" })
                : res.redirect('/login');
        }
        const user = req.user;
        const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

        return isApiRequest(req)
            ? res.json({ success: true, posts, user })
            : res.render('./pages/writer/writerHome', { user, posts });
    } catch (err) {
        return isApiRequest(req)
            ? res.json({ success: false, message: "Something went wrong" })
            : res.send("Something went wrong");
    }
};

// Login page
module.exports.login = (req, res) => {
    return isApiRequest(req)
        ? res.json({ success: true, message: "Login page" })
        : res.render('./pages/auth/login')
};

// Handle login
module.exports.loginHandle = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            if (!isApiRequest(req)) req.flash("error_msg", "User not found");
            return isApiRequest(req)
                ? res.json({ success: false, message: "User not found" })
                : res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            if (!isApiRequest(req)) req.flash("error_msg", "Invalid password");
            return isApiRequest(req)
                ? res.json({ success: false, message: "Invalid password" })
                : res.redirect('/login');
        }

        passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                if (!isApiRequest(req)) req.flash("error_msg", "Authentication failed");
                return isApiRequest(req)
                    ? res.json({ success: false, message: "Authentication failed" })
                    : res.redirect('/login');
            }

            req.logIn(user, (err) => {
                if (err) return next(err);

                if (!isApiRequest(req)) req.flash("success_msg", "Login successful");
                return isApiRequest(req)
                    ? res.json({ success: true, message: "Login successful", user })
                    : res.redirect("/blog");
            });
        })(req, res, next);

    } catch (error) {
        if (!isApiRequest(req)) req.flash("error_msg", "Login failed");
        return isApiRequest(req)
            ? res.json({ success: false, message: "Login failed" })
            : res.redirect('/login');
    }
};


// Signup page
module.exports.signup = (req, res) => {
    return isApiRequest(req)
        ? res.json({ success: true, message: "Signup page" })
        : res.render('./pages/auth/signup');
};

// Handle signup
module.exports.signupHandle = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            if (!isApiRequest(req)) req.flash("error_msg", "User already exists");
            return isApiRequest(req)
                ? res.json({ success: false, message: "User already exists" })
                : res.redirect('/signup');
        }

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashed, role });

        if (!isApiRequest(req)) req.flash("success_msg", "Signup successful. Please login.");
        return isApiRequest(req)
            ? res.json({ success: true, message: "User created", user: newUser })
            : res.redirect('/login');
    } catch (error) {
        if (!isApiRequest(req)) req.flash("error_msg", "Signup failed");
        return isApiRequest(req)
            ? res.json({ success: false, message: "Signup failed" })
            : res.redirect('/signup');
    }
};


// Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            if (!isApiRequest(req)) req.flash("error_msg", "Logout failed");
            return next(err);
        }

        if (!isApiRequest(req)) req.flash("success_msg", "Logged out successfully");

        return isApiRequest(req)
            ? res.json({ success: true, message: "Logout successful" })
            : res.redirect("/login");
    });
};


module.exports.changePassPage = (req, res) => {
    return res.render('./pages/auth/changePass', { user: req.user });
}


module.exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        //  Find user
        const user = await User.findById(id);
        if (!user) {
            req.flash("error_msg", "User not found");
            return res.redirect('/changePass');
        }

        //  Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            req.flash("error_msg", "Old password is incorrect");
            return res.redirect('/changePass');
        }

        //  Check new vs confirm
        if (newPassword !== confirmPassword) {
            req.flash("error_msg", "New password and confirm password do not match");
            return res.redirect('/changePass');
        }

        //  Hash new password + save
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        //  Success flash + redirect
        req.flash("success_msg", "Password changed successfully");
        return res.redirect('/login');

    } catch (error) {
        console.log("Change password error:", error.message);
        req.flash("error_msg", "Password change failed");
        return res.redirect('/changePass');
    }
};

