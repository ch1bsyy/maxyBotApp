const Account = require("../models/accountModel");
const jwt = require("jsonwebtoken");

// Make JWT Token
const generateToken = (account) => {
  return jwt.sign(
    { id: account._id, role: account.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

// Endpoint: POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Empty Input Validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan kata sandi wajib diisi!" });
    }

    // Find Account by username
    const account = await Account.findOne({ username });
    if (!account)
      return res.status(401).json({ message: "Username tidak ditemukan" });

    if (!account.isActive)
      return res
        .status(403)
        .json({ message: "Akun anda telah dinonaktifkan." });

    if (account && (await account.matchPassword(password))) {
      res.status(200).json({
        message: "Login berhasil",
        data: {
          _id: account._id,
          username: account.username,
          full_name: account.full_name,
          role: account.role,
          profile_picture: account.profile_picture,
        },
        token: generateToken(account),
      });
    } else {
      res.status(401).json({ message: "Kata sandi salah!" });
    }
  } catch (error) {
    console.error("Login Controller Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { accountId, username, full_name, profile_picture } = req.body;

    const account = await Account.findById(accountId);
    if (!account)
      return res.status(404).json({ message: "Akun tidak ditemukan" });

    // Update field
    if (username) account.username = username;
    if (full_name) account.full_name = full_name;
    if (profile_picture) account.profile_picture = profile_picture;

    const updatedAccount = await account.save();

    res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: {
        _id: updatedAccount._id,
        username: updatedAccount.username,
        full_name: updatedAccount.full_name,
        profile_picture: updatedAccount.profile_picture,
      },
    });
  } catch (error) {
    // If username already used
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// PUT /api/v1/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { accountId, oldPassword, newPassword } = req.body;

    const account = await Account.findById(accountId);
    if (!account)
      return res.status(404).json({ message: "Akun tidak ditemukan" });

    const isMatch = await account.matchPassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Password lama salah!" });

    account.password = newPassword;
    await account.save();

    res.status(200).json({ message: "Password berhasil diubah!" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
