require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.SERVER_PORT | 4000;
const cors = require("cors");
const pg = require("pg"),
  session = require("express-session"),
  pgSession = require("connect-pg-simple")(session);

const { allUsers } = require("./db/queries");

const pgPool = new pg.Pool({
  database: process.env.DATABASE,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('uploads'))
// set up express-session and storing it in postgres database
app.use(
  session({
    store: new pgSession({
      pool: pgPool,
      tableName: "user_sessions",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
      httpOnly: true,
    },
  })
);

app.use("/login", require("./routes/login"));
app.use("/officers", require("./routes/officers-login"));
app.use("/signup", require("./routes/signup"));
app.use('/portal', require('./routes/portal'))
app.use('/officers/investigator', require('./routes/investigators'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
