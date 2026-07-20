const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Account = require("./models/accountModel");

dotenv.config();

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
  },
  // add object new account
];

//  Function Create/Reset Account
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Account.deleteMany();

    await Account.create(accountData);
    console.log("🚀 Semua Akun Akun berhasil disuntikkan ke MongoDB!");
    process.exit();
  } catch (error) {
    console.error("❌ Gagal melakukan seeding:", error);
    process.exit(1);
  }
};

// Function Clear All Account
const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Account.deleteMany();

    console.log("🗑️ Data akun berhasil dibersihkan (Dihapus semua)!");
    process.exit();
  } catch (error) {
    console.error("❌ Gagal menghapus data:", error);
    process.exit(1);
  }
};

// detect argument on terminal
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
