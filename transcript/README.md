The full Claude Code session that produced this video (JSONL, as Claude Code stores it).

To resume it in Claude Code, from the folder you want to work in:

    DIR="$HOME/.claude/projects/$(pwd | sed 's/[^A-Za-z0-9]/-/g')"; mkdir -p "$DIR"
    cp transcript/claude-code-session.jsonl "$DIR/2e904ee2-e47d-4cc6-842e-bbe5eba1e8e5.jsonl"
    claude --resume 2e904ee2-e47d-4cc6-842e-bbe5eba1e8e5
