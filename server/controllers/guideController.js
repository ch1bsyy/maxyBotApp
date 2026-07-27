// GET ALL GUIDES
exports.getAllGuides = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("dashboard_guides")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal memuat panduan" });
  }
};

// CREATE GUIDE (Superadmin Only)
exports.createGuide = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    const { data, error } = await req.supabase
      .from("dashboard_guides")
      .insert([{ question, answer, category }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat panduan" });
  }
};

// UPDATE GUIDE (Superadmin Only)
exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;
    const { data, error } = await req.supabase
      .from("dashboard_guides")
      .update({
        question,
        answer,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui panduan" });
  }
};

// DELETE GUIDE (Superadmin Only)
exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await req.supabase
      .from("dashboard_guides")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.status(200).json({ message: "Panduan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus panduan" });
  }
};
