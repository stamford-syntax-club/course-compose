import "module-alias/register";
import "dotenv/config";
import app from "./app";

const port = process.env.PORT || 8002;

app.listen(port, () => {
	console.log(`Server is 🔥 at http://localhost:${port}`);
});
