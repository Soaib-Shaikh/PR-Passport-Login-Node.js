exports.isAuth = (req, res, next) => {
    if (req.user) return next();
    return res.redirect('/login');
};

exports.allowUsers = (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    if (req.user.role === 'user') return next();
    return res.redirect('/login');
};
