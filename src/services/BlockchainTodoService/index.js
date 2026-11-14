export async function sendTodo(input) {
  const response = await fetch("/api/blockchain-todos", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Protection": "1" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(20000),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? "Không kết nối được API todo local.")
  }
  return result.data
}
