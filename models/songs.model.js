const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songsSchema = new Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
    },
    artist: {
      type: String,
      required: true,
      minlength: 3,
      unique: false,
    },
  },
  { timestamps: true }
);

const SimpleSongs = mongoose.model("SimpleSong", songsSchema);
module.exports = SimpleSongs;
