const User = require("../models/userModel");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

// Endpoint: POST /api/v1/webhook/n8n
exports.handleN8nWebhook = async (req, res) => {
  const {
    phone_number,
    name,
    university,
    city,
    partner,
    full_name,
    gender,
    employment_status,
    ipk,
    messages,
    isConnectToCS,
    leadType,
  } = req.body;

  if (
    !phone_number ||
    !messages ||
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    return res.status(400).json({
      message: "phone_number and non-empty messages array are required",
    });
  }

  try {
    // object kosong untuk menampung data yang akan di-update
    const updateData = {};

    // Isi objek hanya dengan data yang valid (tidak null, undefined, atau string kosong)
    if (name) updateData.name = name;
    if (university) updateData.university = university;
    if (city) updateData.city = city;
    if (partner) updateData.partner = partner;
    if (full_name) updateData.full_name = full_name;
    if (gender) updateData.gender = gender;
    if (employment_status) updateData.employment_status = employment_status;
    if (ipk) updateData.ipk = ipk;

    updateData.isLeadActive = true;

    updateData.lastInteractionAt = new Date();

    if (isConnectToCS === true || leadType === "hot") {
      updateData.handlingMode = "manual";
      updateData.leadType = leadType || "hot";
      updateData.handledBy = null;
    }

    // Langkah 1: Cari atau buat user baru (Find or Create)
    const user = await User.findOneAndUpdate(
      { phone_number: phone_number },
      // $set hanya akan meng-update field yang ada di dalam `updateData`.
      { $set: updateData },
      { upsert: true, new: true },
    );

    // Langkah 2: Cari atau buat 'wadah' percakapan untuk user ini.
    const conversation = await Conversation.findOneAndUpdate(
      { userId: user._id },
      { $set: { userId: user._id } },
      { upsert: true, new: true },
    );

    // Langkah 3: Siapkan semua pesan untuk disimpan dengan menambahkan conversationId.
    const newMessages = messages.map((msg) => ({
      ...msg, // Salin properti yang ada (sender, text)
      conversationId: conversation._id, // Tambahkan 'link' ke wadah percakapan
    }));

    // Langkah 4: Simpan semua pesan baru ke koleksi Message sekaligus.
    // Ini jauh lebih efisien daripada $push.
    await Message.insertMany(newMessages);

    res.status(200).json({ message: "Data processed successfully." });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Endpoint: GET /api/v1/webhook/check-status/:phone_number
exports.checkHandlingStatus = async (req, res) => {
  try {
    const { phone_number } = req.params;
    const user = await User.findOne({ phone_number: phone_number });

    if (!user) {
      return res.status(200).json({ handlingMode: "bot" });
    }

    return res.status(200).json({ handlingMode: user.handlingMode });
  } catch (error) {
    console.error("Status Check Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
