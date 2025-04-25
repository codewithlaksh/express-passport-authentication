export const checkAuth = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        return res.status(401).send("Unauthorized access!")
    }
}