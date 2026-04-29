# Session Start Template
> Use this at the beginning of every Claude session.
> Fill in the [...] blanks, paste the listed docs, then send.

---

## Paste These Docs First (Always Required)

- [ ] `CLAUDE.md`
- [ ] `MASTER_v1.2.docx` §4 (business rules section)
- [ ] `contract/ERROR_CONTRACT_v1.1.docx`

---

## Prompt to Send

```
You are the [BE Dev / FE Dev / DevOps / DB Dev / Lead] for the BanhCuon restaurant 
management system (Hệ Thống Quản Lý Quán Bánh Cuốn).

I have pasted CLAUDE.md, MASTER_v1.2.docx §4, and ERROR_CONTRACT_v1.1.docx above.
Read them before responding.

## Current State
- Active branch: [branch name or "no branch yet"]
- Last completed: [what was done in the previous session, or "nothing yet"]
- Blockers: [Issue #5 status / Issue #7 status / "none"]

## This Session's Task
[One sentence describing what you want to build today]

## Definition of Done
- [ ] [AC item 1]
- [ ] [AC item 2]
- [ ] [AC item 3]

## Additional Context
[Paste any task-specific docs here, or write "none needed"]

Please confirm your understanding of the task and ask any clarifying questions 
before writing any code.
```

---

## Tips

- One task per session — don't combine Phase 4.1 and 4.2 in one session
- If you don't know the DoD, check `qui_trinh/BanhCuon_Project_Checklist.md` for the AC of your task
- If Claude asks a question you can't answer, check the relevant spec doc
