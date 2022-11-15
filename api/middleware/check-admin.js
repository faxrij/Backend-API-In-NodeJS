
function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    
    try{
        const token = req.headers.authorization.split(" ")[1];
        // console.log(token);
        const decoded = parseJwt(token);
        console.log(decoded);
        // if(decoded)
        // req.userData = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Auth failed"
        });
    }
}