import { vi } from "vitest";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "mock-app" })),
}));

vi.mock("firebase/firestore", () => {
  const mockDb = { _mock: true };
  return {
    collection: vi.fn(() => "collection_ref"),
    doc: vi.fn((_, ...path) => ({ id: path.join("/"), _mock: true })),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn((...args) => args),
    where: vi.fn((field, op, value) => ({ type: "where", field, op, value })),
    orderBy: vi.fn((field, dir) => ({ type: "orderBy", field, dir })),
    writeBatch: vi.fn(() => ({
      update: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    })),
    onSnapshot: vi.fn((_, callback) => {
      if (callback) callback({ docs: [] });
      return vi.fn();
    }),
    getFirestore: vi.fn(() => mockDb),
  };
});

vi.mock("firebase/auth", () => {
  class MockGoogleAuthProvider {}
  return {
    getAuth: vi.fn(() => ({ _mock: true })),
    GoogleAuthProvider: MockGoogleAuthProvider,
  };
});

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({ _mock: true })),
}));
