require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const corsOptions = require("./config/cors");
const userRouter = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const { checkDatabaseConnection } = require("./config/database");

//Init app
const app = express();

//Check if conection with Postgre is correct
checkDatabaseConnection();

//Middlewares
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

//Routers
app.use("/users", userRouter);

//Starts server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
