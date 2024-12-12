const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user && role.includes(req.user.role)) {
            next();
        } else {
            res.status(401).send('Not authorized');
        }
    }
}

export default checkRole;