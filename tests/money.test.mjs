import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./load-typescript.mjs";

const { parseMoneyInput, formatMoneyInput } =
  loadTypeScript("src/lib/money.ts");

test("accepts Argentine currency and decimal keyboard formats without losing cents", () => {
  for (const [input, expected] of [
    ["18.500,50", 18500.5],
    [" $ 125,75 ", 125.75],
    ["125.75", 125.75],
    ["1.000", 1000],
    ["0,01", 0.01],
    ["1000000", 1000000],
  ]) {
    assert.equal(parseMoneyInput(input), expected, input);
    assert.equal(parseMoneyInput(formatMoneyInput(expected)), expected);
  }
});

test("rejects malformed, zero, negative, unsafe and overprecise amounts", () => {
  for (const input of [
    "",
    "0",
    "-12",
    "abc",
    "1,234.56",
    "12.3456",
    "1e6",
    "NaN",
    "Infinity",
    "9.999.999.999.999",
    "12,345",
    "10 000",
  ]) {
    assert.equal(parseMoneyInput(input), null, input);
  }
});
