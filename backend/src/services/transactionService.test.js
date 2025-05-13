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

  it("remove deletes transaction", async () => {
    supabase.from.mockReturnValue({
      delete: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
    });
    await expect(
      transactionService.remove(user_id, "tx-1")
    ).resolves.toBeUndefined();
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
