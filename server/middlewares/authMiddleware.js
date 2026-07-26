const jwt = require("jsonwebtoken");

// Validate JWT Login
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { data: account, error } = await req.supabase
        .from("accounts")
        .select("id, username, full_name, role, is_active, profile_picture")
        .eq("id", decoded.id)
        .single();

      if (error || !account) {
        return res
          .status(401)
          .json({ message: "Akses ditolak, token tidak valid." });
      }

      req.user = {
        ...account,
        _id: account.id,
      };

      next();
    } catch (error) {
      res.status(401).json({ message: "Akses ditolak, token tidak valid." });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Akses ditolak, tidak ada token." });
  }
};

exports.superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "SUPERADMIN") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Akses Ditolak. Membutuhkan izin Superadmin." });
  }
};
