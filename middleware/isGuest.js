export const isGuest = (req, res, next) => {
    if (req.user) {
        return res.redirect('/user/profile');
    } else {
        next();
    }
}