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
    const updatePayload = {};

    if (name) updatePayload.name = name;
    if (university) updatePayload.university = university;
    if (city) updatePayload.city = city;
    if (partner) updatePayload.partner = partner;
    if (full_name) updatePayload.full_name = full_name;
    if (gender) updatePayload.gender = gender;
    if (employment_status) updatePayload.employment_status = employment_status;
    if (ipk) updatePayload.ipk = ipk;

    updatePayload.is_lead_active = true;
    updatePayload.last_interaction_at = new Date().toISOString();

    if (isConnectToCS === true || leadType === "hot") {
      updatePayload.handling_mode = "manual";
      updatePayload.lead_type = leadType || "hot";
      updatePayload.handled_by = null;
    }

    // Find or Create New User
    let { data: user } = await req.supabase
      .from("users")
      .select("*")
      .eq("phone_number", phone_number)
      .single();

    if (user) {
      const { data: updatedUser, error: updateError } = await req.supabase
        .from("users")
        .update(updatePayload)
        .eq("phone_number", phone_number)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      updatePayload.phone_number = phone_number;
      const { data: newUser, error: insertError } = await req.supabase
        .from("users")
        .insert([updatePayload])
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    // Find or Create Conversation
    let { data: conversation } = await req.supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      const { data: newConv, error: convError } = await req.supabase
        .from("conversations")
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (convError) throw convError;
      conversation = newConv;
    }

    // Prepare Array Messages
    const newMessages = messages.map((msg) => ({
      conversation_id: conversation.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp || new Date().toISOString(),
    }));

    // Insert Messages
    const { error: msgError } = await req.supabase
      .from("messages")
      .insert(newMessages);
    await Message.insertMany(newMessages);

    if (msgError) throw msgError;

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

    const { data: user, error } = await req.supabase
      .from("users")
      .select("handling_mode")
      .eq("phone_number", phone_number)
      .single();

    if (error || !user) {
      return res.status(200).json({ handlingMode: "bot" });
    }

    return res.status(200).json({ handlingMode: user.handling_mode });
  } catch (error) {
    console.error("Status Check Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
