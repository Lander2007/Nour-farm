#!/usr/bin/env node

/**
 * Noor Farm Admin Password Hash Generator
 * Usage:
 *   node scripts/hash-password.mjs "your-strong-password"
 */

import crypto from "node:crypto"

const password = process.argv[2]

if (!password) {
  console.error("❌ Error: Please provide a password as an argument.")
  console.log("Usage: node scripts/hash-password.mjs \"your-strong-password\"")
  process.exit(1)
}

const salt = crypto.randomBytes(16).toString("hex")
const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex")
const hash = `scrypt:${salt}:${derived}`

console.log("\n========================================")
console.log("🔑 NOOR FARM ADMIN CREDENTIALS GENERATED")
console.log("========================================")
console.log("\nAdd the following lines to your .env.local (and in Vercel Project Settings):\n")
console.log(`ADMIN_USERNAME=admin`)
console.log(`ADMIN_PASSWORD_HASH="${hash}"`)
console.log(`SESSION_SECRET="${crypto.randomBytes(32).toString("hex")}"`)
console.log("\n========================================\n")
