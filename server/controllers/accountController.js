const Account = require("../models/accountModel");
const bcrypt = require("bcryptjs");

// GET ALL ACCOUNTS
exports.getAccounts = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const accounts = await Account.find(query)
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Gagal memuat data akun" });
  }
};

// CREATE NEW ACCOUNT
exports.createAccount = async (req, res) => {
  try {
    const { username, full_name, password, role } = req.body;

    const isExists = await Account.findOne({ username });
    if (isExists)
      return res.status(400).json({ message: "Username sudah digunakan!" });

    const newAccount = await Account.create({
      username,
      full_name,
      password,
      role,
    });
    res
      .status(201)
      .json({ message: "Akun staf berhasil ditambahkan", data: newAccount });
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat akun" });
  }
};

// UPDATE ACCOUNT
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, password, role } = req.body;

    const account = await Account.findById(id);
    if (!account)
      return res.status(404).json({ message: "Akun tidak ditemukan" });

    if (username !== account.username) {
      const isExists = await Account.findOne({ username });
      if (isExists)
        return res
          .status(400)
          .json({ message: "Username sudah digunakan oleh staf lain!" });
      account.username = username;
    }

    if (full_name) account.full_name = full_name;
    if (role) account.role = role;
    if (password) account.password = password;

    await account.save();
    res.status(200).json({ message: "Data akun berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui akun" });
  }
};

// DEACTIVE ACCOUNT
exports.deactiveAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);
    if (!account)
      return res.status(404).json({ message: "Akun tidak ditemukan" });

    // Toggle Status
    account.isActive = !account.isActive;
    await account.save();

    res.status(200).json({
      message: `Akun berhasil ${account.isActive ? "diaktifkan" : "dinonaktifkan"}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengubah status akun" });
  }
};
