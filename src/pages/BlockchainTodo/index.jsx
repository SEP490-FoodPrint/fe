import { useState } from "react"
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material"

import { sendTodo } from "src/services/BlockchainTodoService"

function TodoCard({ todo }) {
  const [text, setText] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function verify(event) {
    event.preventDefault()
    setResult(null)
    setError("")
    setPending(true)
    try {
      setResult(await sendTodo({ action: "verify", recordId: todo.recordId, text }))
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: "var(--space-4)", overflowWrap: "anywhere" }}>
      <Stack spacing="var(--space-3)">
        <Typography variant="h6" sx={{ whiteSpace: "pre-wrap" }}>{todo.text}</Typography>
        <Typography variant="body2">Record ID <code>{todo.recordId}</code></Typography>
        <Typography variant="body2">Hash on-chain <code>{todo.onChainHash}</code></Typography>
        <Typography variant="body2">Giao dịch <code>{todo.txHash}</code></Typography>
        <Typography variant="body2">Block {todo.blockNumber}</Typography>
        <Stack component="form" onSubmit={verify} spacing="var(--space-3)" alignItems="start">
          <TextField
            label="Văn bản để đối chiếu"
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setResult(null)
              setError("")
            }}
            disabled={pending}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
            multiline
            fullWidth
          />
          <Button type="submit" variant="outlined" disabled={pending}>
            {pending ? "Đang đọc blockchain…" : "So sánh hash"}
          </Button>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        {result && (
          <Alert severity={result.matches ? "success" : "warning"}>
            <Typography>{result.matches ? "Trùng khớp" : "Không trùng khớp"}</Typography>
            <Typography variant="body2">Hash văn bản nhập <code>{result.inputHash}</code></Typography>
            <Typography variant="body2">Hash vừa đọc từ contract <code>{result.onChainHash}</code></Typography>
          </Alert>
        )}
      </Stack>
    </Paper>
  )
}

export default function BlockchainTodo() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function createTodo(event) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      const record = await sendTodo({ action: "create", text })
      setTodos((current) => [{ ...record, text }, ...current])
      setText("")
    } catch (err) {
      setError(err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: "var(--space-6)" }}>
      <Stack spacing="var(--space-4)">
        <Box>
          <Typography variant="h4" component="h1">Todo trên blockchain local</Typography>
          <Typography color="text.secondary">
            Backend băm nguyên văn nội dung. Danh sách trên trang sẽ mất khi tải lại.
          </Typography>
        </Box>
        <Stack component="form" onSubmit={createTodo} spacing="var(--space-3)" alignItems="start">
          <TextField
            label="Nội dung todo"
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={pending}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
            multiline
            fullWidth
            required
          />
          <Button type="submit" variant="contained" disabled={pending || !text.trim()}>
            {pending ? "Đang ghi blockchain…" : "Thêm todo"}
          </Button>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        {todos.length === 0 && <Typography color="text.secondary">Chưa có todo.</Typography>}
        {todos.map((todo) => <TodoCard key={todo.recordId} todo={todo} />)}
      </Stack>
    </Container>
  )
}
