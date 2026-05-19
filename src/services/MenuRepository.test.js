import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";
import { MenuRepository } from "./MenuRepository.js";

describe("MenuRepository", () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new MenuRepository();
  });

  describe("getByCategory", () => {
    beforeEach(() => {
      repo.allPlatos = [
        { id: "1", name: "Ceviche", category: ["Entrada"] },
        { id: "2", name: "Lomo Saltado", category: ["Plato de Fondo"] },
        { id: "3", name: "Sopa del Dia", category: ["Entrada", "Menú del Día"] },
        { id: "4", name: "Chicha", category: ["Bebida Menú"] },
        { id: "5", name: "Arroz Chaufa", category: ["Plato de Fondo", "Especialidad"] },
      ];
    });

    it("should return all platos for 'Todos' category excluding menu-only items", () => {
      const result = repo.getByCategory("Todos");
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toContain("2");
      expect(result.map((p) => p.id)).toContain("5");
    });

    it("should filter by specific category", () => {
      const result = repo.getByCategory("Plato de Fondo");
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toContain("2");
      expect(result.map((p) => p.id)).toContain("5");
    });

    it("should exclude menu-only items from specific category filter", () => {
      const result = repo.getByCategory("Entrada");
      expect(result).toHaveLength(0);
    });

    it("should handle single string category", () => {
      repo.allPlatos = [{ id: "1", name: "Test", category: "Plato de Fondo" }];
      const result = repo.getByCategory("Plato de Fondo");
      expect(result).toHaveLength(1);
    });
  });

  describe("loadAllPlatos", () => {
    it("should load platos from Firestore and cache them", async () => {
      const mockDocs = [
        { id: "1", data: () => ({ name: "Ceviche" }) },
        { id: "2", data: () => ({ name: "Lomo" }) },
      ];
      firestore.getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await repo.loadAllPlatos();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: "1", name: "Ceviche" });
      expect(repo.allPlatos).toEqual(result);
    });
  });

  describe("saveDailyMenuVisibility", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.saveDailyMenuVisibility(true);
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("Firestore error"));
      const result = await repo.saveDailyMenuVisibility(true);
      expect(result).toBe(false);
    });
  });

  describe("saveDailyMenu", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.saveDailyMenu({ entradas: [], segundos: [] });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.saveDailyMenu({});
      expect(result).toBe(false);
    });
  });

  describe("saveHeroPromo", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      const result = await repo.saveHeroPromo({ banners: [] });
      expect(result).toBe(true);
    });
  });

  describe("addPlato", () => {
    it("should return true on success", async () => {
      firestore.addDoc.mockResolvedValue({ id: "new-id" });
      firestore.getDocs.mockResolvedValue({ docs: [] });
      const result = await repo.addPlato({ name: "Test", category: "Entrada" });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.addDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.addPlato({ name: "Test" });
      expect(result).toBe(false);
    });
  });

  describe("deletePlato", () => {
    it("should return true on success", async () => {
      firestore.deleteDoc.mockResolvedValue();
      firestore.getDocs.mockResolvedValue({ docs: [] });
      const result = await repo.deletePlato("1");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.deleteDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.deletePlato("1");
      expect(result).toBe(false);
    });
  });

  describe("updatePlato", () => {
    it("should return true on success", async () => {
      firestore.setDoc.mockResolvedValue();
      firestore.getDocs.mockResolvedValue({ docs: [] });
      const result = await repo.updatePlato("1", { name: "Updated" });
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      firestore.setDoc.mockRejectedValue(new Error("fail"));
      const result = await repo.updatePlato("1", { name: "Updated" });
      expect(result).toBe(false);
    });
  });

  describe("getCategoriesFromFirestore", () => {
    it("should return categories sorted by orden field", async () => {
      const mockDocs = [
        { id: "c1", data: () => ({ nombre: "Segundo", orden: 2 }) },
        { id: "c2", data: () => ({ nombre: "Primero", orden: 1 }) },
        { id: "c3", data: () => ({ nombre: "Sin orden" }) },
      ];
      firestore.getDocs.mockResolvedValue({ docs: mockDocs });

      const result = await repo.getCategoriesFromFirestore();

      expect(result[0].nombre).toBe("Primero");
      expect(result[1].nombre).toBe("Segundo");
      expect(result[2].nombre).toBe("Sin orden");
    });

    it("should return empty array on error", async () => {
      firestore.getDocs.mockRejectedValue(new Error("fail"));
      const result = await repo.getCategoriesFromFirestore();
      expect(result).toEqual([]);
    });
  });

  describe("saveCategoriesOrder", () => {
    it("should return true on success", async () => {
      const batch = { update: vi.fn(), commit: vi.fn().mockResolvedValue() };
      firestore.writeBatch.mockReturnValue(batch);
      const result = await repo.saveCategoriesOrder([{ id: "c1" }, { id: "c2" }]);
      expect(result).toBe(true);
      expect(batch.update).toHaveBeenCalledTimes(2);
    });

    it("should return false on error", async () => {
      firestore.writeBatch.mockReturnValue({
        update: vi.fn(),
        commit: vi.fn().mockRejectedValue(new Error("fail")),
      });
      const result = await repo.saveCategoriesOrder([{ id: "c1" }]);
      expect(result).toBe(false);
    });
  });

  describe("getOpcionesParaAdmin", () => {
    it("should use cached data when available", async () => {
      repo.allPlatos = [
        { id: "1", name: "Entrada", category: ["Entrada"] },
        { id: "2", name: "Segundo", category: ["Menú del Día"] },
        { id: "3", name: "Refresco", category: ["Bebida Menú"] },
      ];

      const result = await repo.getOpcionesParaAdmin();

      expect(result.entradas).toHaveLength(1);
      expect(result.segundos).toHaveLength(1);
      expect(result.refrescos).toHaveLength(1);
    });

    it("should return empty arrays on error", async () => {
      repo.allPlatos = [];
      firestore.getDocs.mockRejectedValue(new Error("fail"));
      const result = await repo.getOpcionesParaAdmin();
      expect(result).toEqual({ entradas: [], segundos: [], refrescos: [] });
    });
  });
});
