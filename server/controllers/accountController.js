const bcrypt = require("bcryptjs");

// GET ALL ACCOUNTS
exports.getAccounts = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    let query = req.supabase
      .from("accounts")
      .select(
        "id, username, full_name, role, is_active, profile_picture, created_at",
      )
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,username.ilike.%${search}%`,
      );
    }

    if (isActive !== undefined) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data: accounts, error } = await query;

    if (error) throw error;

    const formattedAccounts = accounts.map((acc) => ({
      ...acc,
      _id: acc.id,
      isActive: acc.is_active,
      createdAt: acc.created_at,
    }));

    res.status(200).json(formattedAccounts);
  } catch (error) {
    console.error("Get Accounts Error:", error);
    res.status(500).json({ message: "Gagal memuat data akun" });
  }
};

// CREATE NEW ACCOUNT
exports.createAccount = async (req, res) => {
  try {
    const { username, full_name, password, role } = req.body;

    const { data: isExists } = await req.supabase
      .from("accounts")
      .select("id")
      .eq("username", username)
      .single();

    if (isExists)
      return res.status(400).json({ message: "Username sudah digunakan!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert to Supabase
    const { data: newAccount, error } = await req.supabase
      .from("accounts")
      .insert([
        {
          username,
          full_name,
          password: hashedPassword,
          role: role || "ADMIN",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const mappedAccount = {
      ...newAccount,
      _id: newAccount.id,
      isActive: newAccount.is_active,
    };

    res
      .status(201)
      .json({ message: "Akun staf berhasil ditambahkan", data: mappedAccount });
  } catch (error) {
    console.error("Create Account Error:", error);
    res.status(500).json({ message: "Gagal membuat akun" });
  }
};

// UPDATE ACCOUNT
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, password, role } = req.body;

    const { data: account, error: findError } = await req.supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    const updateData = {};

    // Check Duplicate Username
    if (username && username !== account.username) {
      const { data: isExists } = await req.supabase
        .from("accounts")
        .select("id")
        .eq("username", username)
        .single();

      if (isExists) {
        return res
          .status(400)
          .json({ message: "Username sudah digunakan oleh staf lain!" });
      }
      updateData.username = username;
    }

    if (full_name) updateData.full_name = full_name;
    if (role) updateData.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const { error: updateError } = await req.supabase
      .from("accounts")
      .update(updateData)
      .eq("id", id);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Data akun berhasil diperbarui" });
  } catch (error) {
    console.error("Update Account Error:", error);
    res.status(500).json({ message: "Gagal memperbarui akun" });
  }
};

// DEACTIVE ACCOUNT
exports.deactiveAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: account, error: findError } = await req.supabase
      .from("accounts")
      .select("is_active")
      .eq("id", id)
      .single();

    if (findError || !account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    const newStatus = !account.is_active;

    const { error: updateError } = await req.supabase
      .from("accounts")
      .update({ is_active: newStatus })
      .eq("id", id);

    if (updateError) throw updateError;

    res.status(200).json({
      message: `Akun berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
    });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({ message: "Gagal mengubah status akun" });
  }
};
