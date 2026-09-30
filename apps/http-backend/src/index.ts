import { Elysia } from "elysia";
import { router } from "./routes/v1";

const app = new Elysia();
app.use(router);

app.listen(3000, () => console.log(`server is running at ${app.server?.port}`));
