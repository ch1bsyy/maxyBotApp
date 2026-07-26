const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
require("dotenv").config();

global.WebSocket = require("ws");

// Init Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL atau SUPABASE_KEY belum diatur di .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const accountData = [
  {
    username: "chichi",
    password: "Chiboy090402",
    full_name: "Chiboy Cristian Sibarani",
    role: "SUPERADMIN",
  },
  {
    username: "titi",
    password: "Titi123",
    full_name: "Vestyo Gelcheri Amalo",
    role: "ADMIN",
  },
  // add another account here
];

// Function Create/Reset Account
const importData = async () => {
  try {
    console.log("⏳ Memulai proses enkripsi dan seeding ke Supabase...");

    // 1. Encrypte (Hash) password
    const salt = await bcrypt.genSalt(10);
    const hashedAccounts = await Promise.all(
      accountData.map(async (acc) => ({
        username: acc.username,
        password: await bcrypt.hash(acc.password, salt),
        full_name: acc.full_name,
        role: acc.role,
      })),
    );

    // Delete Old Account
    const usernames = accountData.map((a) => a.username);
    await supabase.from("accounts").delete().in("username", usernames);

    // Insert New Account
    const { error } = await supabase.from("accounts").insert(hashedAccounts);

    if (error) throw error;

    console.log("🚀 Semua Akun berhasil disuntikkan ke Supabase PostgreSQL!");
    process.exit();
  } catch (error) {
    console.error("❌ Gagal melakukan seeding:", error.message || error);
    process.exit(1);
  }
};

// Function Clear All Account
const destroyData = async () => {
  try {
    console.log("⏳ Sedang menghapus seluruh data akun...");

    const { error } = await supabase
      .from("accocd unts")
      .delete()
      .neq("username", "placeholder_yang_tidak_mungkin_ada");

    if (error) throw error;

    console.log("🗑️ Data akun berhasil dibersihkan (Dihapus semua)!");
    process.exit();
  } catch (error) {
    console.error("❌ Gagal menghapus data:", error.message || error);
    process.exit(1);
  }
};

// Detect argument on terminal
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
