import "module-alias/register";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const port = process.env.PORT || 8002;

app.listen(port, () => {
  console.log(`Server is 🔥 at http://localhost:${port}`);
});
