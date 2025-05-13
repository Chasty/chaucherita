const authService = require("./authService");
const supabase = require("../config/supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../config/supabaseClient");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("authService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("register", () => {
    it("should throw if required fields are missing", async () => {
      await expect(authService.register({})).rejects.toThrow(
        "Missing required fields"
      );
    });
    it("should throw if user already exists", async () => {
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({ single: () => ({ data: { id: 1 }, error: null }) }),
        }),
      });
      await expect(
        authService.register({ email: "a@a.com", password: "pass", name: "A" })
      ).rejects.toThrow("User already exists");
    });
    it("should create user and return user and token", async () => {
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({ single: () => ({ data: null, error: null }) }),
        }),
      });
      bcrypt.hash.mockResolvedValue("hashed");
      supabase.from
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({ single: () => ({ data: null, error: null }) }),
          }),
        })
        .mockReturnValueOnce({
          insert: () => ({
            select: () => ({
              single: () => ({
                data: { id: 1, email: "a@a.com", name: "A" },
                error: null,
              }),
            }),
          }),
        });
      jwt.sign.mockReturnValue("token");
      const result = await authService.register({
        email: "a@a.com",
        password: "pass",
        name: "A",
      });
      expect(result).toEqual({
        user: { id: 1, email: "a@a.com", name: "A" },
        token: "token",
      });
    });
  });

  describe("login", () => {
    it("should throw if required fields are missing", async () => {
      await expect(authService.login({})).rejects.toThrow(
        "Missing required fields"
      );
    });
    it("should throw if user not found", async () => {
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({ single: () => ({ data: null, error: "err" }) }),
        }),
      });
      await expect(
        authService.login({ email: "a@a.com", password: "pass" })
      ).rejects.toThrow("Invalid credentials");
    });
    it("should throw if password is invalid", async () => {
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: { id: 1, email: "a@a.com", name: "A", password: "hashed" },
              error: null,
            }),
          }),
        }),
      });
      bcrypt.compare.mockResolvedValue(false);
      await expect(
        authService.login({ email: "a@a.com", password: "pass" })
      ).rejects.toThrow("Invalid credentials");
    });
    it("should return user and token on success", async () => {
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: { id: 1, email: "a@a.com", name: "A", password: "hashed" },
              error: null,
            }),
          }),
        }),
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token");
      const result = await authService.login({
        email: "a@a.com",
        password: "pass",
      });
      expect(result).toEqual({
        user: { id: 1, email: "a@a.com", name: "A" },
        token: "token",
      });
    });
  });
});
