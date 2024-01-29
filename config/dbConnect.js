const mongoose = require("mongoose");
const mongourl=process.env.MONGO_URI;
const connectdb = async () => {
  try {
    console.log("in connection");
    const connect = await mongoose.connect(mongourl);

    console.log(
      "Database Connected",
      connect.connection.host,
      connect.connection.name
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectdb;