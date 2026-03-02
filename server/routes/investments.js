const express = require("express");
const router = express.Router();
const {
  sendInterest,
  getMyInvestments,
  getReceivedInvestments,
  updateInvestment,
} = require("../controllers/investmentController");
const { protect, authorize } = require("../middleware/auth");

router.post("/:ideaId", protect, authorize("investor"), sendInterest);
router.get("/my", protect, authorize("investor"), getMyInvestments);
router.get("/received", protect, getReceivedInvestments);
router.put("/:id", protect, updateInvestment);

module.exports = router;
