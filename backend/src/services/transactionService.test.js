const transactionService = require("./transactionService");
const supabase = require("../config/supabaseClient");

jest.mock("../config/supabaseClient");

describe("transactionService", () => {
  const user_id = "user-1";
  const transaction = {
    id: "tx-1",
    user_id,
    amount: 100,
    type: "income",
    category: "salary",
    description: "Test",
    date: "2024-06-11T00:00:00Z",
    tags: ["work"],
    notes: "note",
  };

  afterEach(() => jest.clearAllMocks());

  it("getAll returns transactions for user", async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({ order: () => ({ data: [transaction], error: null }) }),
      }),
    });
    const result = await transactionService.getAll(user_id);
    expect(result).toEqual([transaction]);
  });

  it("getById returns transaction for user", async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({ single: () => ({ data: transaction, error: null }) }),
        }),
      }),
    });
    const result = await transactionService.getById(user_id, "tx-1");
    expect(result).toEqual(transaction);
  });

  it("create inserts and returns transaction", async () => {
    supabase.from.mockReturnValue({
      insert: () => ({
        select: () => ({ single: () => ({ data: transaction, error: null }) }),
      }),
    });
    const result = await transactionService.create(user_id, transaction);
    expect(result).toEqual(transaction);
  });

  it("update updates and returns transaction", async () => {
    supabase.from.mockReturnValue({
      update: () => ({
        eq: () => ({
          eq: () => ({
            select: () => ({
              single: () => ({ data: transaction, error: null }),
            }),
          }),
        }),
      }),
    });
    const result = await transactionService.update(user_id, "tx-1", {
      amount: 200,
    });
    expect(result).toEqual(transaction);
  });

  it("remove soft deletes transaction and sets last_synced_at and updated_at", async () => {
    const now = 1234567890;
    jest.spyOn(Date, "now").mockReturnValue(now);
    const updateMock = jest
      .fn()
      .mockReturnValue({ eq: () => ({ eq: () => ({ error: null }) }) });
    supabase.from.mockReturnValue({ update: updateMock });
    await expect(
      transactionService.remove(user_id, "tx-1")
    ).resolves.toBeUndefined();
    expect(updateMock).toHaveBeenCalledWith({
      sync_status: "deleted",
      last_synced_at: now,
      updated_at: now,
    });
    Date.now.mockRestore();
  });

  it("getAll returns soft-deleted transaction with sync_status = 'deleted'", async () => {
    const deletedTx = { ...transaction, sync_status: "deleted" };
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({ order: () => ({ data: [deletedTx], error: null }) }),
      }),
    });
    const result = await transactionService.getAll(user_id);
    expect(result[0].sync_status).toBe("deleted");
  });

  it("throws on error", async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => ({ data: null, error: { message: "fail" } }),
        }),
      }),
    });
    await expect(transactionService.getAll(user_id)).rejects.toBeTruthy();
  });
});

describe("sync and updatedSince", () => {
  const user_id = "user-1";
  const now = new Date().toISOString();
  const old = new Date(Date.now() - 100000).toISOString();
  const tx1 = { id: "tx-1", user_id, amount: 10, updated_at: 1000 };
  const tx2 = { id: "tx-2", user_id, amount: 20, updated_at: 500 };

  afterEach(() => jest.clearAllMocks());

  it("sync upserts new transactions and sets last_synced_at, created_at, updated_at", async () => {
    const now = 987654321;
    jest.spyOn(Date, "now").mockReturnValue(now);
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({ single: () => ({ data: null, error: null }) }),
      }),
    });
    const upsertMock = jest.fn().mockReturnValue({
      select: () => ({
        single: () => ({
          data: {
            ...tx1,
            created_at: now,
            updated_at: now,
            last_synced_at: now,
          },
          error: null,
        }),
      }),
    });
    supabase.from.mockReturnValueOnce({ upsert: upsertMock });
    const result = await transactionService.sync(user_id, [tx1]);
    expect(upsertMock).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          created_at: now,
          updated_at: now,
          last_synced_at: now,
          sync_status: "synced",
        }),
      ],
      { onConflict: ["id"] }
    );
    expect(result[0]).toEqual(
      expect.objectContaining({
        created_at: now,
        updated_at: now,
        last_synced_at: now,
      })
    );
    Date.now.mockRestore();
  });

  it("sync skips upsert if existing is newer", async () => {
    const newer = {
      ...tx1,
      updated_at: 2000,
    };
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({ single: () => ({ data: newer, error: null }) }),
      }),
    });
    const result = await transactionService.sync(user_id, [tx1]);
    expect(result[0]).toEqual(newer);
  });

  it("updatedSince returns filtered transactions", async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          gt: () => ({ order: () => ({ data: [tx1], error: null }) }),
        }),
      }),
    });
    const result = await transactionService.updatedSince(user_id, 500);
    expect(result).toEqual([tx1]);
  });
});
