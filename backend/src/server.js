import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js"

await connectDB(); //Llamamos a la funcion encargada de conectar con la BBDD



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});