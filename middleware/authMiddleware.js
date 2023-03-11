const jwt = require("jsonwebtoken");

exports.authMiddleware = async (req, res, next) => {
  // const { authToken } = req.cookies;
  // if (authToken) {
  //   const deCodeToken = await jwt.verify(authToken, process.env.SECRET);
  //   req.myId = deCodeToken.id;
  //   next();
  // } else {
  //   res.status(400).json({
  //     error: {
  //       errorMessage: ["Please Loing First"],
  //     },
  //   });
  // }
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer")) {
    res.status(400).json({
      error: {
        errorMessage: ["Please Loing First"],
      },
    });
  }
  const token = authorization.split(" ")[1];
  try {
    const deCodeToken = await jwt.verify(token, process.env.SECRET);
    req.myId = deCodeToken.id;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        errorMessage: ["Token has expired. Please login again."],
      },
    });
  }
};
