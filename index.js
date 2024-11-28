const fs = require("fs");
const jsonServer = require("json-server");
const path = require("path");

const index = jsonServer.create();

const router = jsonServer.router(path.resolve(__dirname, "db.json"));

index.use(jsonServer.defaults({}));
index.use(jsonServer.bodyParser);

index.post("/login", (req, res) => {
  try {
    const { login, password } = req.body;
    const db = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "db.json"), "UTF-8")
    );
    const { users = [] } = db;

    const userFromBd = users.find(
      (user) => user.login === login && user.password === password
    );

    if (userFromBd) {
      return res.json(userFromBd);
    }

    return res.status(403).json({ message: "Неправильный логин или пароль" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

index.post("/reg", (req, res) => {
  try {
    const { surname, name, patronymic, phone, email, password, login } =
      req.body;
    const dbPath = path.resolve(__dirname, "db.json");
    const db = JSON.parse(fs.readFileSync(dbPath, "UTF-8"));
    const { users = [] } = db;

    const userFromDb = users.find((user) => user.login === login);

    if (userFromDb) {
      return res.status(403).json({ message: "Логин уже используется" });
    }

    const newUser = {
      surname,
      name,
      patronymic,
      phone,
      email,
      password,
      login,
    };
    users.push(newUser);
    fs.writeFileSync(dbPath, JSON.stringify({ ...db, users }, null, 2));

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

index.use((req, res, next) => {
  next();
});

index.use(router);

index.listen(100, () => {
  console.log("server is running on 100 port");
});
