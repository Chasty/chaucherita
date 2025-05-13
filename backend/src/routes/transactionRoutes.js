const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", transactionController.getAll);
router.get("/updated-since", transactionController.updatedSince);
router.get("/:id", transactionController.getById);
router.post("/", transactionController.create);
router.put("/:id", transactionController.update);
router.delete("/:id", transactionController.remove);
router.post("/sync", transactionController.sync);
router.get("/sync/pull", transactionController.syncPull);
router.post("/sync/push", transactionController.syncPush);

module.exports = router;
