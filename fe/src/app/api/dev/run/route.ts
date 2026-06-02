import { NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"

const REPO_ROOT = path.join(process.cwd(), "..")

const COMMANDS: Record<string, string> = {
  seed: "go run ./be/cmd/seed/main.go",
  "build-be": "docker compose up -d --build be",
  "build-fe": "docker compose up -d --build fe",
}

export async function POST(req: NextRequest) {
  const { cmd } = await req.json()

  if (!cmd || !COMMANDS[cmd]) {
    return NextResponse.json({ error: "Unknown command" }, { status: 400 })
  }

  const command = COMMANDS[cmd]

  return new Promise<NextResponse>((resolve) => {
    exec(command, { cwd: REPO_ROOT, timeout: 300_000 }, (error, stdout, stderr) => {
      if (error) {
        resolve(
          NextResponse.json({ ok: false, output: stderr || error.message }, { status: 500 })
        )
      } else {
        resolve(NextResponse.json({ ok: true, output: stdout || stderr || "Done." }))
      }
    })
  })
}
