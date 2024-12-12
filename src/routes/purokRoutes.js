const express = require("express");
const router = express.Router();
const {
  getPuroks,
  getPurokPopulation,
} = require("../controllers/puroksController");
const { isAdmin } = require("../middlewares/auth");
router.get("/purok", getPuroks);

router.get("/purok/:purokId/population", isAdmin, getPurokPopulation);

module.exports = router;
