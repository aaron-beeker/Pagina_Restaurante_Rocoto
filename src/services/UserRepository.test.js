import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";
import { UserRepository } from "./UserRepository.js";

describe("UserRepository", () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new UserRepository();
  });

  describe("getUserRole", () => {
    it("should return client for null email", async () => {
      const result = await repo.getUserRole(null);
      expect(result).toBe("client");
    });

    it("should return client for undefined email", async () => {
      const result = await repo.getUserRole(undefined);
      expect(result).toBe("client");
    });

    it("should return client for empty email", async () => {
      const result = await repo.getUserRole("");
      expect(result).toBe("client");
    });

    it("should return role from Firestore when user exists", async () => {
      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ role: "admin", name: "Test" }),
      });

      const result = await repo.getUserRole("test@example.com");
      expect(result).toBe("admin");
    });

    it("should return client when user does not exist", async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });

      const result = await repo.getUserRole("unknown@example.com");
      expect(result).toBe("client");
    });

    it("should return client when user has no role field", async () => {
      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ name: "Test" }),
      });

      const result = await repo.getUserRole("test@example.com");
      expect(result).toBe("client");
    });

    it("should return client on error", async () => {
      firestore.getDoc.mockRejectedValue(new Error("Firestore error"));
      const result = await repo.getUserRole("test@example.com");
      expect(result).toBe("client");
    });
  });

  describe("getAllUsers", () => {
    it("should return all users from Firestore", async () => {
      const mockDocs = [
        {
          id: "user1@example.com",
          data: () => ({ role: "admin", name: "Admin" }),
        },
        {
          id: "user2@example.com",
          data: () => ({ role: "client", name: "Client" }),
        },
      ];
      firestore.getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await repo.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe("user1@example.com");
      expect(result[0].role).toBe("admin");
    });

    it("should return empty array on error", async () => {
      firestore.getDocs.mockRejectedValue(new Error("fail"));
      const result = await repo.getAllUsers();
      expect(result).toEqual([]);
    });
  });

  describe("deleteUser", () => {
    it("should return true on success", async () => {
      firestore.deleteDoc.mockResolvedValue();
      const result = await repo.deleteUser("test@example.com");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.deleteDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.deleteUser("test@example.com");
      expect(result).toBe(false);
    });
  });

  describe("makeAdmin", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.makeAdmin("test@example.com");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.makeAdmin("test@example.com");
      expect(result).toBe(false);
    });
  });

  describe("saveUser", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.saveUser("test@example.com", {
        role: "admin",
        name: "Test",
      });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.saveUser("test@example.com", {});
      expect(result).toBe(false);
    });
  });

  describe("setUserRole", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.setUserRole("test@example.com", "admin");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.setUserRole("test@example.com", "client");
      expect(result).toBe(false);
    });
  });
});
