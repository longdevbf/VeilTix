import { getAddress } from "viem";

const addr = "0x11c8a82B00eFf4EdD7583474A4bAe5D54F75f515";
try {
  console.log("Original:", addr);
  console.log("Checksummed:", getAddress(addr));
} catch (e) {
  console.error("Error with original:", e.message);
  try {
    console.log("Checksummed from lowercase:", getAddress(addr.toLowerCase()));
  } catch (e2) {
    console.error("Error with lowercase:", e2.message);
  }
}
