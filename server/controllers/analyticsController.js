const { format, subDays, startOfDay } = require("date-fns");

// GET /api/v1/analytics/super-overview
exports.getSuperOverview = async (req, res) => {
  try {
    // Get Service Summary from View
    const { data: serviceSummary, error: summaryError } = await req.supabase
      .from("chat_service_summary")
      .select("*");

    if (summaryError) throw summaryError;

    // Get Admin Performance from View
    const { data: adminPerformance, error: perfError } = await req.supabase
      .from("admin_performance_stats")
      .select("*")
      .order("total_resolved", { ascending: false });

    // 3. Data Grafik Tren Penyelesaian (7 Hari Terakhir)
    // Ini agak kompleks jika dari history JSON, best practice:
    // buat tabel terpisah untuk log aktivitas.
    // Untuk sekarang, kita agregasi manual dari View performa (estimasi berdasarkan tanggal selesai)

    // Agregasi ini sebaiknya dilakukan di DB, tapi untuk kemudahan demo,
    // kita asumsikan histori performa lengkap.

    res.status(200).json({
      serviceSummary: serviceSummary || [],
      adminPerformance: adminPerformance || [],
      // chartData: ... (logika chart tren mirip dashboard biasa tapi sumbernya dari data history ter-resolve)
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};
