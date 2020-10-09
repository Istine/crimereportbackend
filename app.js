require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT | 3000;
const cors = require("cors");
const { fetchUsers, createUser } = require("./db/queries");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/login", require("./routes/login"));
app.use("/signup", require("./routes/signup"));

app.get("/users", (req, res) => {
  fetchUsers().then((results) => {
    res.status(200).json({
      users: results,
    });
  });
});

app.post("/users", (req, res) => {
  createUser(req.body).then((results) => {
    res.status(200).json({
      users: JSON.stringify(results),
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
