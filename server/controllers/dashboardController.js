const User = require("../models/userModel");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const mongoose = require("mongoose");

// GET METRIK DASHBOARD
exports.getDashboardMetrics = async (req, res) => {
  try {
    const currentUser = req.user;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total Chat Today
    const totalChatToday = await User.countDocuments({
      lastInteractionAt: { $gte: today },
    });

    // Menghitung Leads berdasarkan status
    const hotLeads = await User.countDocuments({
      leadType: "hot",
      isLeadActive: true,
    });

    const generalLeads = await User.countDocuments({
      leadType: "general",
      isLeadActive: true,
    });

    const completedMatchCriteria = {
      "handlingHistory.handledBy": { $ne: null },
    };

    if (currentUser.role !== "SUPERADMIN") {
      completedMatchCriteria["handlingHistory.handledBy"] =
        new mongoose.Types.ObjectId(currentUser._id);
    }

    const completedLeadsAgg = await User.aggregate([
      { $unwind: "$handlingHistory" },
      { $match: completedMatchCriteria },
      { $count: "total" },
    ]);

    const completedLeads =
      completedLeadsAgg.length > 0 ? completedLeadsAgg[0].total : 0;

    // Ranking Staf
    const adminRanking = await User.aggregate([
      { $unwind: "$handlingHistory" },
      { $match: { "handlingHistory.handledBy": { $ne: null } } },
      {
        $group: {
          _id: "$handlingHistory.handledBy",
          totalResolved: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "_id",
          as: "adminData",
        },
      },
      { $unwind: "$adminData" },
      { $sort: { totalResolved: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          adminName: "$adminData.full_name",
          username: "$adminData.username",
          totalResolved: 1,
        },
      },
    ]);

    // Grafik
    const chartData = [];
    const daysIndo = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const count = await User.countDocuments({
        lastInteractionAt: { $gte: startOfDay, $lt: endOfDay },
      });

      chartData.push({
        name: daysIndo[startOfDay.getDay()],
        chat: count,
      });
    }

    res.status(200).json({
      totalChatToday,
      hotLeads,
      generalLeads,
      completedLeads,
      adminRanking,
      chartData,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching metrics" });
  }
};

// GET LIST USER BY LEADS
exports.getLeads = async (req, res) => {
  try {
    const { search, leadType, isLeadActive } = req.query; // filter from frontend

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone_number: { $regex: search, $options: "i" } },
      ];
    }

    if (leadType) query.leadType = leadType;

    // Konversi string "true"/"false" from query params frontend to boolean
    if (isLeadActive !== undefined) {
      query.isLeadActive = isLeadActive === "true";
    }

    //sorting descending
    // Populate 'handledBy' to display the admin handling on frontend
    const leads = await User.find(query)
      .populate("handledBy", "username full_name")
      .sort({ lastInteractionAt: -1 });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads" });
  }
};

// GET CHAT HISTORY
exports.getChatHistory = async (req, res) => {
  try {
    const { phone_number } = req.params;

    const user = await User.findOne({ phone_number }).populate(
      "handledBy",
      "username full_name",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const conversation = await Conversation.findOne({ userId: user._id });
    if (!conversation) return res.status(200).json({ user, messages: [] });

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 });

    res.status(200).json({ user, messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

// Endpoint: PUT /api/v1/dashboard/update-handling/:phone_number
exports.updateHandlingMode = async (req, res) => {
  const { phone_number } = req.params;
  // action = takeover or complete
  const { action, accountId } = req.body;

  if (!["takeover", "complete"].includes(action)) {
    return res.status(400).json({ message: "Invalid action type" });
  }

  try {
    const userToUpdate = await User.findOne({ phone_number });
    if (!userToUpdate)
      return res.status(404).json({ message: "User not found" });

    // Savety for date
    if (!userToUpdate.lastInteractionAt) {
      userToUpdate.lastInteractionAt = userToUpdate.createdAt;
    }

    if (action === "takeover") {
      userToUpdate.handlingMode = "manual";
      userToUpdate.isLeadActive = true;
      userToUpdate.handledBy = accountId || null;
    } else if (action === "complete") {
      userToUpdate.handlingHistory.push({
        handledBy: userToUpdate.handledBy,
        leadType: userToUpdate.leadType,
        completedAt: new Date(),
      });

      // Reset Status
      userToUpdate.handlingMode = "bot";
      userToUpdate.isLeadActive = false;
      userToUpdate.leadType = "general";
      userToUpdate.handledBy = null;
    }

    await userToUpdate.save();

    const updatedUser = await User.findOne({ phone_number }).populate(
      "handledBy",
      "username full_name",
    );

    res.status(200).json({
      message: `User status successfully updated for action: ${action}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Handling Mode Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET UNIQUE CITIES
exports.getCities = async (req, res) => {
  try {
    // Get City and Ignore null value
    const cities = await User.distinct("city", { city: { $nin: [null, ""] } });
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cities" });
  }
};
