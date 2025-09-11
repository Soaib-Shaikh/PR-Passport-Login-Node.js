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
            .populate('author', 'username')
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
            featuredAuthor
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
        : res.render('./pages/auth/login');
};

// Handle login
module.exports.loginHandle = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");

            return isApiRequest(req)
                ? res.json({ success: false, message: "User not found" })
                : res.redirect('/login?error=notfound');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid password");

            return isApiRequest(req)
                ? res.json({ success: false, message: "Invalid password" })
                : res.redirect('/login?error=invalid');
        }

        passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return isApiRequest(req)
                    ? res.json({ success: false, message: "Authentication failed" })
                    : res.redirect('/login?error=authfailed');
            }

            req.logIn(user, (err) => {
                if (err) return next(err);
                console.log('Login Successful.');

                return isApiRequest(req)
                    ? res.json({ success: true, message: "Login successful", user })
                    : res.redirect("/blog");
            });
        })(req, res, next);

    } catch (error) {
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
            console.log("User already exists.");
            return isApiRequest(req)
                ? res.json({ success: false, message: "User already exists" })
                : res.redirect('/signup?error=exists');
        }

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashed, role });

        console.log("User Created.");
        return isApiRequest(req)
            ? res.json({ success: true, message: "User Created.", user: newUser })
            : res.redirect('/login');
    } catch (error) {
        return isApiRequest(req)
            ? res.json({ success: false, message: "Signup failed" })
            : res.redirect('/signup');
    }
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.session.destroy((err) => {
            if (err) return next(err);
            console.log("User logged out.");

            return isApiRequest(req)
                ? res.json({ success: true, message: "Logout successful" })
                : res.redirect("/login");
        });
    });
};

module.exports.changePassPage = (req, res) => {
    return res.render('./pages/auth/changePass', { user: req.user });
}


module.exports.changePassword = async (req, res) => {
    try {
        let { id } = req.params;
        let { oldPassword, newPassword, confirmPassword } = req.body;

        let user = await User.findById(id);

        let isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            console.log("Old Password is incorrect");
            return res.redirect('/changePass');
        }

        if (newPassword !== confirmPassword) {
            console.log("New Password and Confirm Password do not match");
            return res.redirect('/changePass');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        console.log("Password changed successfully");
        return res.redirect('/logout');
    } catch (error) {
        console.log(error.message);
        return res.redirect('/changePass');
    }
}