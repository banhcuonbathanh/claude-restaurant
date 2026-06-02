"use client"

import { useState } from "react"
import { Terminal, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

type CmdKey = "seed" | "build-be" | "build-fe"
type Status = "idle" | "running" | "ok" | "error"

const BUTTONS: { key: CmdKey; label: string; desc: string }[] = [
  { key: "seed", label: "Seed DB", desc: "go run ./be/cmd/seed/main.go" },
  { key: "build-be", label: "Build BE", desc: "docker compose up -d --build be" },
  { key: "build-fe", label: "Build FE", desc: "docker compose up -d --build fe" },
]

export function DevPanel() {
  const [statuses, setStatuses] = useState<Record<CmdKey, Status>>({
    seed: "idle", "build-be": "idle", "build-fe": "idle",
  })
  const [outputs, setOutputs] = useState<Record<CmdKey, string>>({
    seed: "", "build-be": "", "build-fe": "",
  })
  const [expanded, setExpanded] = useState<CmdKey | null>(null)

  async function run(key: CmdKey) {
    setStatuses((s) => ({ ...s, [key]: "running" }))
    setOutputs((o) => ({ ...o, [key]: "" }))
    setExpanded(key)
    try {
      const res = await fetch("/api/dev/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: key }),
      })
      const data = await res.json()
      setStatuses((s) => ({ ...s, [key]: data.ok ? "ok" : "error" }))
      setOutputs((o) => ({ ...o, [key]: data.output || "" }))
    } catch (e) {
      setStatuses((s) => ({ ...s, [key]: "error" }))
      setOutputs((o) => ({ ...o, [key]: String(e) }))
    }
  }

  const icon = (status: Status) => {
    if (status === "running") return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-success" />
    if (status === "error") return <XCircle className="h-4 w-4 text-destructive" />
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-fg">
        <Terminal className="h-3.5 w-3.5" />
        Dev Tools
      </div>
      <div className="space-y-2">
        {BUTTONS.map(({ key, label, desc }) => (
          <div key={key} className="rounded-lg border border-border/60 bg-background/50">
            <div className="flex items-center gap-3 p-2">
              <Button
                size="sm"
                variant={statuses[key] === "error" ? "destructive" : "outline"}
                className="min-w-[90px]"
                disabled={statuses[key] === "running"}
                onClick={() => run(key)}
              >
                {statuses[key] === "running" ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Running</>
                ) : label}
              </Button>
              <code className="flex-1 text-xs text-muted-fg">{desc}</code>
              {icon(statuses[key])}
              {outputs[key] && (
                <button
                  className="text-muted-fg hover:text-foreground"
                  onClick={() => setExpanded(expanded === key ? null : key)}
                >
                  {expanded === key
                    ? <ChevronUp className="h-3.5 w-3.5" />
                    : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
            {expanded === key && outputs[key] && (
              <pre className="max-h-40 overflow-auto border-t border-border/60 p-2 text-[11px] text-muted-fg">
                {outputs[key]}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
