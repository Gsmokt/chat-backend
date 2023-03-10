const jwt = require("jsonwebtoken");

exports.authMiddleware = async (req, res, next) => {
  const { authToken } = req.cookies;
  if (authToken) {
    const deCodeToken = await jwt.verify(authToken, process.env.SECRET);
    req.myId = deCodeToken.id;
    next();
  } else {
    res.status(400).json({
      error: {
        errorMessage: ["Please Loing First"],
      },
    });
  }
};
