const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/auth");
const { getPopulation } = require("../controllers/populationController");

router.get("/population", isAdmin, getPopulation);

module.exports = router;
