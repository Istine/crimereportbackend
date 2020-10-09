require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT | 3000;
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
