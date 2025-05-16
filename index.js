import { app } from "./app.js";
import { connectToMongoDB } from "./src/config/connectToMongoDB.js";
import { PORT } from "./src/config/index.js";
import dotenv from "dotenv";

dotenv.config();

connectToMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB Connection Failed!! ${error}`);
    process.exit(1);
  });
