import "./config/env.js";
import { validateStartupConfig } from "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initAdmin } from "./utils/initAdmin.js";

const configCheck = validateStartupConfig();
if (configCheck.errors.length > 0) {
  console.error("Critical configuration error(s):", configCheck.errors);
}
if (configCheck.warnings.length > 0) {
  configCheck.warnings.forEach(w => console.warn("Configuration notice:", w));
}

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await initAdmin();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
