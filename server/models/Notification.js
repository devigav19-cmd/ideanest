const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "collaboration_request",
        "collaboration_accepted",
        "collaboration_rejected",
        "investment_interest",
        "idea_upvote",
        "new_comment",
        "system",
      ],
      required: true,
    },
    message: { type: String, required: true },
    idea: { type: mongoose.Schema.Types.ObjectId, ref: "Idea" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
