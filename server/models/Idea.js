const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: [
        "Technology",
        "Healthcare",
        "Education",
        "Finance",
        "Environment",
        "Social",
        "Other",
      ],
      default: "Other",
    },
    tags: [{ type: String }],
    stage: {
      type: String,
      enum: ["Concept", "Prototype", "MVP", "Scaling"],
      default: "Concept",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    upvotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    downvotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, min: 1, max: 5 },
      },
    ],
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "archived", "flagged"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Virtual: average rating
ideaSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual: popularity score (upvotes − downvotes)
ideaSchema.virtual("popularityScore").get(function () {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

ideaSchema.set("toJSON", { virtuals: true });
ideaSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Idea", ideaSchema);
