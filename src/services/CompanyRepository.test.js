import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";
import { CompanyRepository } from "./CompanyRepository.js";

describe("CompanyRepository", () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new CompanyRepository();
  });

  describe("getAllCompanies", () => {
    it("should return companies ordered by name", async () => {
      const mockDocs = [
        { id: "c1", data: () => ({ nombre: "Alpha" }) },
        { id: "c2", data: () => ({ nombre: "Beta" }) },
      ];
      firestore.getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await repo.getAllCompanies();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("c1");
      expect(result[0].nombre).toBe("Alpha");
    });

    it("should return empty array on error", async () => {
      firestore.getDocs.mockRejectedValue(new Error("fail"));
      const result = await repo.getAllCompanies();
      expect(result).toEqual([]);
    });
  });

  describe("addCompany", () => {
    it("should return true on success", async () => {
      firestore.addDoc.mockResolvedValue({ id: "new-id" });
      const result = await repo.addCompany({ nombre: "New Company" });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.addDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.addCompany({ nombre: "New Company" });
      expect(result).toBe(false);
    });
  });

  describe("updateCompany", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.updateCompany("c1", { nombre: "Updated" });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.updateCompany("c1", { nombre: "Updated" });
      expect(result).toBe(false);
    });
  });

  describe("deleteCompany", () => {
    it("should return true on success", async () => {
      firestore.deleteDoc.mockResolvedValue();
      const result = await repo.deleteCompany("c1");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.deleteDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.deleteCompany("c1");
      expect(result).toBe(false);
    });
  });
});
