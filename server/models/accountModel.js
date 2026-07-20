const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const accountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["SUPERADMIN", "ADMIN"],
      default: "ADMIN",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile_picture: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// 1. Middleware Mongoose (Pre-save Hook) untuk mengenkripsi password sebelum disimpan
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Generate salt tingkat 10 untuk memperkuat enkripsi
  const salt = await bcrypt.genSalt(10);
  // Timpa password plaintext dengan password yang sudah di-hash
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 2. Instance Method untuk mencocokkan password saat Admin mencoba Login
accountSchema.methods.matchPassword = async function (enteredPassword) {
  // Membandingkan password yang diketik di frontend dengan hash di database
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Account", accountSchema);
