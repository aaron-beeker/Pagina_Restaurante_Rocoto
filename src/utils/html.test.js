import { describe, it, expect } from "vitest";
import { escapeHtml } from "./html.js";

describe("escapeHtml", () => {
  it("should escape ampersand", () => {
    expect(escapeHtml("Rock & Roll")).toBe("Rock &amp; Roll");
  });

  it("should escape less than", () => {
    expect(escapeHtml("a < b")).toBe("a &lt; b");
  });

  it("should escape greater than", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("should escape double quotes", () => {
    expect(escapeHtml('Say "hello"')).toBe("Say &quot;hello&quot;");
  });

  it("should escape all special characters together", () => {
    expect(escapeHtml('<script>alert("x&y")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&amp;y&quot;)&lt;/script&gt;"
    );
  });

  it("should return empty string for null", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("should return empty string for undefined", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("should return the same string if no special characters", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("should convert non-string values to string", () => {
    expect(escapeHtml(42)).toBe("42");
  });

  it("should not double-escape already escaped characters", () => {
    const result = escapeHtml("&amp;");
    expect(result).toBe("&amp;amp;");
  });
});
