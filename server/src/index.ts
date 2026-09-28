import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`TUBA Farm API listening on port ${env.port}`);
});
