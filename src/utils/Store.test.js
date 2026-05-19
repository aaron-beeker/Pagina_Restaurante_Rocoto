import { describe, it, expect, vi, beforeEach } from "vitest";
import { Store, appStore } from "./Store.js";

describe("Store", () => {
  let store;

  beforeEach(() => {
    store = new Store({ count: 0, name: "test" });
  });

  describe("constructor", () => {
    it("should initialize with given state", () => {
      const initialState = { a: 1, b: 2 };
      const s = new Store(initialState);
      expect(s.getState()).toEqual({ a: 1, b: 2 });
    });

    it("should initialize with empty state if no argument", () => {
      const s = new Store();
      expect(s.getState()).toEqual({});
    });
  });

  describe("getState", () => {
    it("should return current state", () => {
      expect(store.getState()).toEqual({ count: 0, name: "test" });
    });
  });

  describe("setState", () => {
    it("should merge new state with existing state", () => {
      store.setState({ count: 5 });
      expect(store.getState()).toEqual({ count: 5, name: "test" });
    });

    it("should add new keys to state", () => {
      store.setState({ extra: "value" });
      expect(store.getState()).toEqual({ count: 0, name: "test", extra: "value" });
    });

    it("should not mutate original state object", () => {
      const prevState = store.getState();
      store.setState({ count: 10 });
      expect(store.getState()).not.toBe(prevState);
    });

    it("should notify listeners after state change", () => {
      const listener = vi.fn();
      store.subscribe(listener);
      listener.mockClear(); // Clear the initial call
      store.setState({ count: 1 });
      expect(listener).toHaveBeenCalledWith({ count: 1, name: "test" });
    });
  });

  describe("subscribe", () => {
    it("should call listener immediately with current state", () => {
      const listener = vi.fn();
      store.subscribe(listener);
      expect(listener).toHaveBeenCalledWith({ count: 0, name: "test" });
    });

    it("should call listener on every state change", () => {
      const listener = vi.fn();
      store.subscribe(listener);
      listener.mockClear();

      store.setState({ count: 1 });
      store.setState({ count: 2 });

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, { count: 1, name: "test" });
      expect(listener).toHaveBeenNthCalledWith(2, { count: 2, name: "test" });
    });

    it("should return unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);
      listener.mockClear();

      unsubscribe();
      store.setState({ count: 99 });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should support multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.subscribe(listener1);
      store.subscribe(listener2);
      listener1.mockClear();
      listener2.mockClear();

      store.setState({ count: 1 });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should only remove the unsubscribed listener", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsubscribe1 = store.subscribe(listener1);
      store.subscribe(listener2);
      listener1.mockClear();
      listener2.mockClear();

      unsubscribe1();
      store.setState({ count: 1 });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("notify", () => {
    it("should notify all listeners with current state", () => {
      const listener = vi.fn();
      store.subscribe(listener);
      listener.mockClear();

      store.setState({ count: 42 });
      expect(listener).toHaveBeenCalledWith({ count: 42, name: "test" });
    });
  });

  describe("appStore singleton", () => {
    it("should have default initial state", () => {
      expect(appStore.getState()).toHaveProperty("user", null);
      expect(appStore.getState()).toHaveProperty("authInitialized", false);
      expect(appStore.getState()).toHaveProperty("activeCategory", "Inicio");
      expect(appStore.getState()).toHaveProperty("dailyMenu");
      expect(appStore.getState()).toHaveProperty("heroPromo", null);
      expect(appStore.getState()).toHaveProperty("restaurantInfo", null);
      expect(appStore.getState()).toHaveProperty("companies");
      expect(Array.isArray(appStore.getState().companies)).toBe(true);
    });

    it("should be a Store instance", () => {
      expect(appStore).toBeInstanceOf(Store);
    });
  });
});
