import assert from "node:assert/strict"
import { test } from "node:test"
import {
  firstUnconfirmed, latestConfirmed, proofVersion, safeExplorerUrl, sealState, shortHash,
} from "../src/services/BlockchainProofService/adapter.js"
import { apiAnchorProofVersion, apiGetProofVersions, apiVerifyProofVersion } from "../src/services/BlockchainProofService/urls.js"

const row = (version, transactionStatus, extra = {}) => proofVersion({
  id: `00000000-0000-4000-8000-00000000000${version}`,
  kind: "registrations",
  recordId: "00000000-0000-4000-8000-000000000100",
  version,
  eventType: version === 3 ? "REGISTRATION_APPROVED" : "REGISTRATION_SUBMITTED",
  dataHash: `0x${"a".repeat(64)}`,
  transactionStatus,
  transactionHash: transactionStatus === "PREPARED" ? null : `0x${"b".repeat(64)}`,
  explorerUrl: transactionStatus === "PREPARED" ? null : `https://sepolia.etherscan.io/tx/0x${"b".repeat(64)}`,
  recordedAt: transactionStatus === "CONFIRMED" ? "2026-11-17T08:00:00.000Z" : null,
  verificationStatus: "NOT_VERIFIED",
  createdAt: "2026-11-17T07:59:00.000Z",
  ...extra,
})

test("one record is sealed only when every version is confirmed", () => {
  assert.equal(sealState([]), "NONE")
  assert.equal(sealState([row(1, "CONFIRMED"), row(2, "SUBMITTED")]), "PENDING")
  assert.equal(sealState([row(1, "CONFIRMED"), row(2, "PREPARED")]), "PENDING")
  assert.equal(sealState([row(1, "FAILED"), row(2, "SUBMITTED")]), "FAILED")
  assert.equal(sealState([row(1, "CONFIRMED"), row(2, "CONFIRMED")]), "CONFIRMED")
})

test("integrity check targets the newest confirmed version; resend targets the oldest open one", () => {
  const versions = [row(1, "CONFIRMED"), row(2, "FAILED"), row(3, "PREPARED")]
  assert.equal(latestConfirmed(versions)?.version, 1)
  assert.equal(firstUnconfirmed(versions)?.version, 2)
  assert.equal(latestConfirmed([row(1, "PREPARED")]), null)
  assert.equal(firstUnconfirmed([row(1, "CONFIRMED")]), null)
})

test("versions get readable event labels and keep document check results", () => {
  const version = row(3, "CONFIRMED", {
    verificationStatus: "MISMATCH",
    documents: [{ id: "d1", field: "certificate_1", fileName: "attp.pdf", status: "MISMATCH" }, null],
  })
  assert.equal(version.eventLabel, "Duyệt hồ sơ")
  assert.deepEqual(version.documents, [{ id: "d1", field: "certificate_1", fileName: "attp.pdf", status: "MISMATCH" }])
  assert.equal(row(1, "CONFIRMED").documents, null)
  assert.throws(() => proofVersion({ id: "x" }), /không hợp lệ/)
})

test("only https Etherscan links are rendered", () => {
  assert.equal(safeExplorerUrl("https://sepolia.etherscan.io/tx/0xabc"), "https://sepolia.etherscan.io/tx/0xabc")
  assert.equal(safeExplorerUrl("http://sepolia.etherscan.io/tx/0xabc"), null)
  assert.equal(safeExplorerUrl("https://evil.example/etherscan.io"), null)
  assert.equal(safeExplorerUrl("javascript:alert(1)"), null)
  assert.equal(safeExplorerUrl(null), null)
})

test("hashes are shortened for display and urls reject unknown kinds", () => {
  assert.equal(shortHash(`0x${"a".repeat(64)}`), "0xaaaaaa…aaaaaa")
  assert.equal(shortHash(null), "—")
  assert.equal(apiGetProofVersions("registrations", "a/b"), "/blockchain-proofs/registrations/a%2Fb/versions")
  assert.equal(apiVerifyProofVersion("deliveries", "v1"), "/blockchain-proofs/deliveries/versions/v1/verify")
  assert.equal(apiAnchorProofVersion("retained-samples", "v1"), "/blockchain-proofs/retained-samples/versions/v1/anchor")
  assert.throws(() => apiGetProofVersions("users", "x"), /không hợp lệ/)
})
