const express = require(
  "express"
);

const router =
  express.Router();

const Incident = require(
  "../models/Incident"
);

router.get(
  "/",
  async (req, res) => {
    try {
      const incidents =
        await Incident.find()
          .sort({
            createdAt: -1,
          })
          .limit(20);

      res.json(incidents);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch incidents",
      });
    }
  }
);

module.exports = router;