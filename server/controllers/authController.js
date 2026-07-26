const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (account) => {
  return jwt.sign(
    { id: account.id, role: account.role },
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

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan kata sandi wajib diisi!" });
    }

    const { data: account, error } = await req.supabase
      .from("accounts")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !account) {
      return res.status(401).json({ message: "Username tidak ditemukan" });
    }

    if (!account.is_active) {
      return res.status(403).json({ message: "Akun anda telah dinonaktifkan" });
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (isMatch) {
      res.status(200).json({
        message: "Login berhasil",
        data: {
          _id: account.id,
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

    const updateData = {};
    if (username) updateData.username = username;
    if (full_name) updateData.full_name = full_name;
    if (profile_picture) updateData.profile_picture = profile_picture;

    const { data: updatedAccount, error } = await req.supabase
      .from("accounts")
      .update(updateData)
      .eq("id", accountId)
      .select()
      .single();

    if (error) {
      // Error Duplicate Username
      if (error.code === "23505") {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      throw error;
    }

    res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: {
        _id: updatedAccount.id,
        username: updatedAccount.username,
        full_name: updatedAccount.full_name,
        profile_picture: updatedAccount.profile_picture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// PUT /api/v1/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { accountId, oldPassword, newPassword } = req.body;

    const { data: account, error } = await req.supabase
      .from("accounts")
      .select("password")
      .eq("id", accountId)
      .single();

    if (error || !account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah!" });
    }

    // Encrypt New Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await req.supabase
      .from("accounts")
      .update({ password: hashedPassword })
      .eq("id", accountId);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Password berhasil diubah!" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
