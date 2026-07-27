// GET METRIK DASHBOARD
exports.getDashboardMetrics = async (req, res) => {
  try {
    const currentUser = req.user;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 1. Total Chat Today
    const { count: totalChatToday } = await req.supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_interaction_at", todayISO);

    // 2. Menghitung Leads berdasarkan status
    const { count: hotLeads } = await req.supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("lead_type", "hot")
      .eq("is_lead_active", true);

    const { count: generalLeads } = await req.supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("lead_type", "general")
      .eq("is_lead_active", true);

    // 3. Menghitung Completed Leads & Ranking Staf (In-Memory Map Reduce)
    const { data: usersHistory } = await req.supabase
      .from("users")
      .select("handling_history");

    let completedLeads = 0;
    const adminCounts = {};

    if (usersHistory) {
      usersHistory.forEach((u) => {
        if (Array.isArray(u.handling_history)) {
          u.handling_history.forEach((history) => {
            if (history.handledBy) {
              if (
                currentUser.role === "SUPERADMIN" ||
                history.handledBy === currentUser._id
              ) {
                completedLeads++;
              }
              adminCounts[history.handledBy] =
                (adminCounts[history.handledBy] || 0) + 1;
            }
          });
        }
      });
    }

    // Ambil detail admin untuk ranking
    const { data: admins } = await req.supabase
      .from("accounts")
      .select("id, username, full_name");
    const adminMap = {};
    if (admins) {
      admins.forEach((a) => (adminMap[a.id] = a));
    }

    const adminRanking = Object.keys(adminCounts)
      .map((adminId) => ({
        adminName: adminMap[adminId]?.full_name || "Unknown",
        username: adminMap[adminId]?.username || "unknown",
        totalResolved: adminCounts[adminId],
      }))
      .sort((a, b) => b.totalResolved - a.totalResolved)
      .slice(0, 5);

    // 4. Grafik (7 Hari Terakhir)
    const chartData = [];
    const daysIndo = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const { count } = await req.supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("last_interaction_at", startOfDay.toISOString())
        .lt("last_interaction_at", endOfDay.toISOString());

      chartData.push({
        name: daysIndo[startOfDay.getDay()],
        chat: count || 0,
      });
    }

    res.status(200).json({
      totalChatToday: totalChatToday || 0,
      hotLeads: hotLeads || 0,
      generalLeads: generalLeads || 0,
      completedLeads,
      adminRanking,
      chartData,
    });
  } catch (error) {
    console.error("Metrik Error:", error);
    res.status(500).json({ message: "Error fetching metrics" });
  }
};

// GET LIST USER BY LEADS
exports.getLeads = async (req, res) => {
  try {
    const { search, leadType, isLeadActive } = req.query;

    let query = req.supabase
      .from("users")
      .select("*, handledBy:handled_by(id, username, full_name)")
      .order("last_interaction_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }
    if (leadType) query = query.eq("lead_type", leadType);
    if (isLeadActive !== undefined)
      query = query.eq("is_lead_active", isLeadActive === "true");

    const { data: leads, error } = await query;
    if (error) throw error;

    const mappedLeads = (leads || []).map((l) => ({
      ...l,
      _id: l.id,
      leadType: l.lead_type,
      isLeadActive: l.is_lead_active,
      handlingMode: l.handling_mode,
      lastInteractionAt: l.last_interaction_at,
      employment_status: l.employment_status,
      employement_status: l.employment_status,
      handledBy: l.handledBy ? { ...l.handledBy, _id: l.handledBy.id } : null,
    }));

    res.status(200).json(mappedLeads);
  } catch (error) {
    console.error("Leads Error:", error);
    res.status(500).json({ message: "Error fetching leads" });
  }
};

// GET CHAT HISTORY
exports.getChatHistory = async (req, res) => {
  try {
    const { phone_number } = req.params;

    const { data: user, error: userError } = await req.supabase
      .from("users")
      .select("*, handledBy:handled_by(id, username, full_name)")
      .eq("phone_number", phone_number)
      .single();

    if (userError || !user)
      return res.status(404).json({ message: "User not found" });

    const mappedUser = {
      ...user,
      _id: user.id,
      leadType: user.lead_type,
      isLeadActive: user.is_lead_active,
      handlingMode: user.handling_mode,
      lastInteractionAt: user.last_interaction_at,
      handledBy: user.handledBy
        ? { ...user.handledBy, _id: user.handledBy.id }
        : null,
    };

    const { data: conversation } = await req.supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!conversation)
      return res.status(200).json({ user: mappedUser, messages: [] });

    const { data: messages } = await req.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("timestamp", { ascending: true });

    res.status(200).json({ user: mappedUser, messages: messages || [] });
  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

// Endpoint: PUT /api/v1/dashboard/update-handling/:phone_number
exports.updateHandlingMode = async (req, res) => {
  const { phone_number } = req.params;
  const { action, accountId, targetAccountId } = req.body;
  const currentAdminRole = req.user.role;

  if (!["takeover", "assign", "complete"].includes(action)) {
    return res.status(400).json({ message: "Invalid action type" });
  }

  try {
    const { data: userToUpdate, error } = await req.supabase
      .from("users")
      .select("*")
      .eq("phone_number", phone_number)
      .single();

    if (error || !userToUpdate)
      return res.status(404).json({ message: "User not found" });

    const updatePayload = {};

    // TAKEOVER LOGIC
    if (action === "takeover") {
      if (
        userToUpdate.handling_mode === "manual" &&
        userToUpdate.handled_by &&
        userToUpdate.handled_by !== accountId
      ) {
        return res
          .status(403)
          .json({ message: "Lead ini sudah dikunci oleh Admin lain." });
      }
      updatePayload.handling_mode = "manual";
      updatePayload.is_lead_active = true;
      updatePayload.handled_by = accountId || null;
      updatePayload.last_interaction_at = new Date().toISOString();
    }
    // ASSIGN LOGIC
    else if (action === "assign") {
      if (
        userToUpdate.handling_mode !== "manual" ||
        (userToUpdate.handled_by !== accountId &&
          currentAdminRole !== "SUPERADMIN")
      ) {
        return res.status(403).json({
          message:
            "Hanya pemilik lead atau Superadmin yang bisa mendelegasikan.",
        });
      }
      if (!targetAccountId) {
        return res.status(400).json({ message: "Admin tujuan harus dipilih." });
      }
      updatePayload.handled_by = targetAccountId;
      updatePayload.last_interaction_at = new Date().toISOString();
    }
    // COMPLETE LOGIC
    else if (action === "complete") {
      if (
        userToUpdate.handling_mode === "manual" &&
        userToUpdate.handled_by !== accountId &&
        currentAdminRole !== "SUPERADMIN"
      ) {
        return res.status(403).json({
          message: "Anda tidak berhak menyelesaikan lead milik Admin lain.",
        });
      }

      const historyItem = {
        handledBy: userToUpdate.handled_by,
        leadType: userToUpdate.lead_type,
        completedAt: new Date().toISOString(),
      };

      const currentHistory = Array.isArray(userToUpdate.handling_history)
        ? userToUpdate.handling_history
        : [];

      currentHistory.push(historyItem);

      updatePayload.handling_history = currentHistory;
      updatePayload.handling_mode = "bot";
      updatePayload.is_lead_active = false;
      updatePayload.lead_type = "general";
      updatePayload.handled_by = null;
    }

    const { error: updateError } = await req.supabase
      .from("users")
      .update(updatePayload)
      .eq("phone_number", phone_number);

    if (updateError) throw updateError;

    const { data: updatedUser } = await req.supabase
      .from("users")
      .select("*, handledBy:handled_by(id, username, full_name)")
      .eq("phone_number", phone_number)
      .single();

    const mappedUser = {
      ...updatedUser,
      _id: updatedUser.id,
      leadType: updatedUser.lead_type,
      isLeadActive: updatedUser.is_lead_active,
      handlingMode: updatedUser.handling_mode,
      handledBy: updatedUser.handledBy
        ? { ...updatedUser.handledBy, _id: updatedUser.handledBy.id }
        : null,
    };

    res.status(200).json({
      message: `User status successfully updated for action: ${action}`,
      user: mappedUser,
    });
  } catch (error) {
    console.error("Update Handling Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET LIST ACTIVE ADMINS FOR DELEGATION
exports.getActiveAdmins = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("accounts")
      .select("id, username, full_name");

    if (error) throw error;

    const mappedAdmins = data.map((admin) => ({
      ...admin,
      _id: admin.id,
    }));

    res.status(200).json(mappedAdmins);
  } catch (error) {
    console.error("Get Admins Error:", error);
    res.status(500).json({ message: "Error fetching admin list" });
  }
};

// GET UNIQUE CITIES (JS Set Deduplication)
exports.getCities = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("users")
      .select("city")
      .not("city", "is", null)
      .neq("city", "");

    if (error) throw error;

    const uniqueCities = [...new Set(data.map((user) => user.city))];

    res.status(200).json(uniqueCities);
  } catch (error) {
    console.error("Cities Error:", error);
    res.status(500).json({ message: "Error fetching cities" });
  }
};
