const mongoose = require("mongoose");

const databaseConnect = (uri) => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Mongodb Database Connected");
    })
    .catch((error) => {
      console.log(error);
    });
};
module.exports = databaseConnect;
