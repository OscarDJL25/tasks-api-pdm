import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const USER = {
  username: "admin",
  passwordHash: await bcrypt.hash("1234", 10),
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (username !== USER.username) {
    return res.status(401).json({ message: "Usuario incorrecto" });
  }

  const valid = await bcrypt.compare(password, USER.passwordHash);
  if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
};
