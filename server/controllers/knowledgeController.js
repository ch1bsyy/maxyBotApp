const validTables = ["bootcamps", "universities", "payments", "internships"];

exports.validateTable = (req, res, next) => {
  const { table } = req.params;
  if (!validTables.includes(table)) {
    return res
      .status(400)
      .json({ message: "Kategori Knowledge Base tidak valid!" });
  }
  next();
};

// GET ALL DATA
exports.getAllData = async (req, res) => {
  try {
    const { table } = req.params;

    const { data, error } = await req.supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error(`Get ${req.params.table} Error:`, error);
    res.status(500).json({ message: `Gagal memuat data ${req.params.table}` });
  }
};

// CREATE DATA
exports.createData = async (req, res) => {
  try {
    const { table } = req.params;
    const payload = req.body;

    const { data, error } = await req.supabase
      .from(table)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Data berhasil ditambahkan", data });
  } catch (error) {
    console.error(`Create ${req.params.table} Error:`, error);
    res.status(500).json({ message: "Gagal menyimpan data baru" });
  }
};

// UPDATE DATA
exports.updateData = async (req, res) => {
  try {
    const { table, id } = req.params;
    const payload = req.body;

    delete payload.id;
    delete payload.created_at;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await req.supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Data berhasil diperbarui", data });
  } catch (error) {
    console.error(`Update ${req.params.table} Error:`, error);
    res.status(500).json({ message: "Gagal memperbarui data" });
  }
};

// DELETE DATA
exports.deleteData = async (req, res) => {
  try {
    const { table, id } = req.params;

    const { error } = await req.supabase.from(table).delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Data berhasil dihapus secara permanen" });
  } catch (error) {
    console.error(`Delete ${req.params.table} Error:`, error);
    res.status(500).json({ message: "Gagal menghapus data" });
  }
};
