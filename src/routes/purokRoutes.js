const express = require("express");
const router = express.Router();
const {
  getPuroks,
  getPurokPopulation,
  getPurok,
  updatePurok,
} = require("../controllers/puroksController");
const { purokUpdateValidator } = require("../validators/purokValidator");
const { isAdmin } = require("../middlewares/auth");
router.get("/purok", getPuroks);

router.get("/purok/:id", isAdmin, getPurok);

router.put("/purok/:id", isAdmin, purokUpdateValidator, updatePurok);

router.get("/purok/:purokId/population", isAdmin, getPurokPopulation);

module.exports = router;
