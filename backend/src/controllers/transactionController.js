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

exports.sync = async (req, res, next) => {
  try {
    const result = await transactionService.sync(
      req.user.id,
      req.body.transactions || []
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updatedSince = async (req, res, next) => {
  try {
    const since = req.query.since;
    const result = await transactionService.updatedSince(req.user.id, since);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.syncPull = async (req, res, next) => {
  try {
    const user_id = req.query.user_id;
    const lastPulledAt = Number(req.query.last_pulled_at) || 0;
    // Fetch all transactions for this user updated since lastPulledAt
    const transactions = await transactionService.updatedSince(
      user_id,
      lastPulledAt
    );
    // WatermelonDB expects changes in { created, updated, deleted } arrays
    const changes = {
      transactions: {
        created: [],
        updated: [],
        deleted: [],
      },
    };
    for (const tx of transactions) {
      if (tx.sync_status === "deleted") {
        changes.transactions.deleted.push(tx.id);
      } else if (tx.created_at > lastPulledAt) {
        changes.transactions.created.push(tx);
      } else {
        changes.transactions.updated.push(tx);
      }
    }
    res.json({ changes, timestamp: Date.now() });
  } catch (err) {
    next(err);
  }
};

exports.syncPush = async (req, res, next) => {
  try {
    const user_id = req.query.user_id;
    const { changes } = req.body;
    let pushed = 0;
    if (changes && changes.transactions) {
      // Handle created and updated
      const upserts = [
        ...(changes.transactions.created || []),
        ...(changes.transactions.updated || []),
      ];
      for (const tx of upserts) {
        await transactionService.sync(user_id, [tx]);
        pushed++;
      }
      // Handle deleted
      const deleted = changes.transactions.deleted || [];
      for (const id of deleted) {
        await transactionService.remove(user_id, id);
        pushed++;
      }
    }
    res.json({ pushed });
  } catch (err) {
    next(err);
  }
};
