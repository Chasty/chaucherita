const transactionService = require("../services/transactionService");

exports.getAll = async (req, res, next) => {
  try {
    const transactions = await transactionService.getAll(req.user.id);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getById(
      req.user.id,
      req.params.id
    );
    if (!transaction) return res.status(404).json({ error: "Not found" });
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.user.id, req.body);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const transaction = await transactionService.update(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await transactionService.remove(req.user.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
