const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true,
    },
    // "feedback" = idea-level review, "discussion" = team discussion
    type: {
      type: String,
      enum: ["feedback", "discussion"],
      default: "feedback",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
