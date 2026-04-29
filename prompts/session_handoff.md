# Session Handoff Template
> Use this at the END of every Claude session.
> Type `/handoff` and Claude will fill this in, or fill it yourself before closing.

---

## Prompt to Send

```
/handoff

Please give me a handoff summary with:
1. What was completed this session (files created/modified)
2. What is NOT done yet (if task is partial)
3. Any open risks or flags to address next session
4. Exact next step to continue
5. The branch name I should be on

Then I'll update CLAUDE.md §Current Work.
```

---

## CLAUDE.md Current Work Update (fill after handoff)

Open `CLAUDE.md` and update the `## Current Work` section:

```markdown
## Current Work

- **Branch:** feature/spec-XXX-[name]
- **Completed:** [what was done]
- **In progress:** [anything partial]
- **Next:** [exact next step]
- **Risks:** [any open ⚠️ FLAG or 🚨 RISK items]
```

---

## End-of-Session Checklist

- [ ] `sqlc generate && go build ./...` passes (if BE session)
- [ ] `npx tsc --noEmit` passes (if FE session)  
- [ ] All new files committed to correct branch
- [ ] `CLAUDE.md §Current Work` updated
- [ ] Any open risks noted for next session
