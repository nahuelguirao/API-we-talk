const authService = require("../services/authServices");
const userService = require("../services/userServices");
const verifications = require("../helpers/verifications");
const jwt = require("jsonwebtoken");
const encryptPassword = require("../helpers/encryptPassword");

//VERIFY JWT TOKEN
const verifyToken = (req, res) => {
  res.status(200).json({
    message: "Token de autenticación válido.",
    userData: req.userData,
  });
};

//LOGIN NORMAL (With form)
const loginUserNormal = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Verify login service
    const { user, token } = await authService.verifyLogin(email, password);

    //Send token + user info (email + username)
    res.status(200).json({ token, user });
  } catch (error) {
    console.log("Error al intentar iniciar sesión: ", error);
    if (
      error.message === "Credenciales incorrectas." ||
      error.message === "Este E-mail está asociado a una cuenta con Google."
    ) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Error interno del servidor." });
    }
  }
};

//REGISTRATION NORMAL (With form)
const registerUserNormal = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //VERIFICATIONS
    if (!verifications.verifyUser(username)) {
      throw new Error("Nombre de usuario ya en uso o inválido.");
    }

    if (!verifications.verifyEmail(email)) {
      throw new Error("E-mail con formato inválido.");
    }

    const isUsernameAvailable = await userService.isUsernameAvailable(username);
    if (!isUsernameAvailable) {
      throw new Error("Username ya en uso.");
    }

    const isEmailAvailable = await userService.isEmailAvailable(email);
    if (!isEmailAvailable) {
      throw new Error("E-mail ya en uso.");
    }

    if (!verifications.verifyPassword(password)) {
      throw new Error("Formato de la contraseña inválido.");
    }

    //Encrypt password before register user
    const passwordEncrypted = await encryptPassword(password);

    //Inserts user's data into the database
    await userService.insertNormalUser({ username, email, passwordEncrypted });

    res.status(200).json({ message: "¡Usuario registrado correctamente!" });
  } catch (error) {
    console.log("Error al intentar registrar al usuario: ", error);
    res.status(400).json({ error: error.message });
  }
};

//LOGIN AND REGISTER WITH GOOGLE
const google = async (req, res) => {
  const { name, email, imageURL, uid } = req.body;

  if (!name || !email || !imageURL) {
    return res.status(400).json({ error: "Enviar name, email y imageURL." });
  }
  try {
    const user = await userService.getUserByEmail(email);

    //If user already exists, updated token and get data
    if (user) {
      const existingUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        imageURL: user.image_url,
      };

      //Creates newToken (to update)
      const newToken = jwt.sign(
        { userData: existingUser },
        process.env.JWT_SECRET,
        { expiresIn: "365d" }
      );

      //Updates token in DB
      await userService.updateToken(newToken, email);

      return res.status(200).json({ token: newToken, user: existingUser });
    }

    //In case of new user:
    //Inserts info in DB
    const newUser = { name, email, imageURL, uid };
    const userData = await userService.insertGoogleUser(newUser);

    //Generates token
    const token = jwt.sign({ userData: userData }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
    await userService.updateToken(token, email);

    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.log("Error en registro con google: ", error);
    res.status(500).json({ error: "Error autenticando con google." });
  }
};

//To UPDATE username
const changeUsername = async (req, res) => {
  const { username, email } = req.body;

  //Verifications
  if (!verifications.verifyUser(username)) {
    return res.status(400).json({ error: "Formato de usuario inválido." });
  }

  if (!username || !email) {
    return res.status(400).json({ error: "Enviar E-mail y username" });
  }

  try {
    //Check if username is unique
    const isAvailable = await userService.isUsernameAvailable(username);

    if (!isAvailable) {
      return res
        .status(400)
        .json({ error: "Nombre de usuario no disponible." });
    }

    //If is unique update it in DB
    await userService.updateUsername(username, email);
    res.status(200).json({ message: "Username establecido correctamente." });
  } catch (error) {
    console.log("Error cambiando el username: ", error);
    res.status(500).json({ error: "Error al intentar cambiar el username." });
  }
};

module.exports = {
  loginUserNormal,
  registerUserNormal,
  google,
  verifyToken,
  changeUsername,
};
