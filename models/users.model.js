const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usersSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true, // helps us to find by username, note that this has a significant production impact
      unique: true,
      minlength: 3,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // minlength: 8,
    },
    //   firstName: String,
    //   lastName: String,
    //   salutation: {
    //     type: String,
    //     enum: ["Dr", "Mr", "Mrs", "Ms", "Miss", "Mdm"],
    //   },
  },
  { timestamps: true }
);

usersSchema.pre("save", async function (next) {
  const rounds = 10;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

const Users = mongoose.model("User", usersSchema);

module.exports = Users;
