import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";
import { WorkerRepository } from "./WorkerRepository.js";

describe("WorkerRepository", () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new WorkerRepository();
  });

  describe("getAllWorkers", () => {
    it("should return workers ordered by apellidos", async () => {
      const mockDocs = [
        { id: "w1", data: () => ({ apellidos: "Alvarez", dni: "123" }) },
        { id: "w2", data: () => ({ apellidos: "Zapata", dni: "456" }) },
      ];
      firestore.getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await repo.getAllWorkers();

      expect(result).toHaveLength(2);
      expect(result[0].apellidos).toBe("Alvarez");
    });

    it("should return empty array on error", async () => {
      firestore.getDocs.mockRejectedValue(new Error("fail"));
      const result = await repo.getAllWorkers();
      expect(result).toEqual([]);
    });
  });

  describe("getWorkerByDni", () => {
    it("should return worker when found", async () => {
      const mockDocs = [{ id: "w1", data: () => ({ apellidos: "Test", dni: "12345678" }) }];
      firestore.getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await repo.getWorkerByDni("12345678");

      expect(result).not.toBeNull();
      expect(result.dni).toBe("12345678");
    });

    it("should return null when not found", async () => {
      firestore.getDocs.mockResolvedValue({ docs: [], empty: true });

      const result = await repo.getWorkerByDni("00000000");

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      firestore.getDocs.mockRejectedValue(new Error("fail"));
      const result = await repo.getWorkerByDni("12345678");
      expect(result).toBeNull();
    });
  });

  describe("addWorker", () => {
    it("should return true on success", async () => {
      firestore.getDocs.mockResolvedValue({ docs: [], empty: true });
      firestore.addDoc.mockResolvedValue({ id: "new-id" });

      const result = await repo.addWorker({
        apellidos: "New",
        nombres: "Worker",
        dni: "12345678",
      });

      expect(result).toBe(true);
    });

    it("should throw error if worker with same DNI exists", async () => {
      firestore.getDocs.mockResolvedValue({
        docs: [{ id: "w1", data: () => ({ dni: "12345678" }) }],
        empty: false,
      });

      await expect(repo.addWorker({ apellidos: "Dup", dni: "12345678" })).rejects.toThrow(
        "Ya existe un trabajador con este DNI"
      );
    });

    it("should re-throw error on Firestore failure", async () => {
      firestore.getDocs.mockResolvedValue({ docs: [], empty: true });
      firestore.addDoc.mockRejectedValue(new Error("Firestore error"));

      await expect(repo.addWorker({ apellidos: "New", dni: "12345678" })).rejects.toThrow(
        "Firestore error"
      );
    });
  });

  describe("updateWorker", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.updateWorker("w1", { apellidos: "Updated" });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.updateWorker("w1", { apellidos: "Updated" });
      expect(result).toBe(false);
    });
  });

  describe("deleteWorker", () => {
    it("should return true on success", async () => {
      firestore.deleteDoc.mockResolvedValue();
      const result = await repo.deleteWorker("w1");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.deleteDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.deleteWorker("w1");
      expect(result).toBe(false);
    });
  });

  describe("subscribeToWorkers", () => {
    it("should call callback with workers on snapshot", () => {
      const mockDocs = [{ id: "w1", data: () => ({ apellidos: "Test" }) }];
      firestore.onSnapshot.mockImplementation((_, successCb) => {
        successCb({ docs: mockDocs });
        return vi.fn();
      });

      const callback = vi.fn();
      repo.subscribeToWorkers(callback);

      expect(callback).toHaveBeenCalledWith([{ id: "w1", apellidos: "Test" }]);
    });

    it("should return unsubscribe function", () => {
      const unsubscribe = vi.fn();
      firestore.onSnapshot.mockReturnValue(unsubscribe);

      const result = repo.subscribeToWorkers(() => {});

      expect(result).toBe(unsubscribe);
    });
  });
});
