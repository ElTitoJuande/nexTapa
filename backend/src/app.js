import express from "express"
import cors from "cors"
import { authRouter } from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js"
import { userRouter } from "./routes/userRoutes.js";
import { establishmentRouter } from "./routes/establishmentRoutes.js"
import { itemRouter } from "./routes/itemRoutes.js";
import { photoRouter } from "./routes/photoRoutes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permite tools como Postman/cURL sin origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());


app.get("/", (req, res) => {
  res.send("NEXTAPA API running ✅");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "nextapa-backend" });
});

app.get("/test-error", (req, res) => {
  throw new Error("Error de prueba");
});



//        RUTAS DE USUARIOS        //

app.use('/api/users', userRouter);
app.use('/api/establishment', establishmentRouter);
app.use('/api/items', itemRouter);
app.use('/api/photos', photoRouter)
app.use('/api/auth', authRouter)

app.use(errorHandler);
export default app;