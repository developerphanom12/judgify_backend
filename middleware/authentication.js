const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const { resposne } = require("../Middleware/resposne");
dotenv.config()
const secretKey = process.env.JWT_SECRET

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth
    });
  }

  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.invalidformat
    });
  }

  const token = tokenParts[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.invalidtoken
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;


