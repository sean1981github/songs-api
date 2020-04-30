const app = require("./app");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}... for songs API`);
});
