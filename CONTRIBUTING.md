# Contributing

LibreScope takes patches by email. **Pull requests are not accepted** — please
don't open one on any mirror, and don't send a merge request either.

## Sending a patch

Work on a branch, commit your change, and mail the commits to
[kzzzl@kzzzl.xyz](mailto:kzzzl@kzzzl.xyz) with `git send-email`:

```bash
git clone https://git.kzzzl.xyz/kzzzl/LibreScope.git
cd LibreScope
git checkout -b my-change
# ... edit, then ...
git commit -am "fix: correct the Debian parent"
git send-email --to=kzzzl@kzzzl.xyz origin/main..my-change
```

`git send-email` ships with Git but is a separate package on most systems
(`git-email` on Debian/Ubuntu, `git` on Nix). If you can't use it, `git format-patch`
and attach the `.patch` files to a normal mail — just keep the commits as they are.

## How a patch should look

Follow the same conventions the history already uses:

- One logical change per commit, with a conventional prefix: `feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`, `style:` or `test:`.
- Keep the subject line short; put the reasoning in the body if it needs explaining.
- Most changes are a data edit to `public/data.json`. Confirm it still parses
  before you send:

  ```bash
  node -e "JSON.parse(require('fs').readFileSync('public/data.json'))"
  ```

- Reach for `src/` only when the change genuinely isn't expressible as data. See
  [AGENTS.md](AGENTS.md) for the full conventions on data, themes, packaging and
  commits.

## Review

I read patches as they arrive and either apply them or reply with what to change.
After a patch lands it becomes part of the project's history; the reply tells you
where it ended up. Send a new patch on top for any follow-up rather than replying
with a diff pasted into the thread.

## License

By contributing you agree your work is licensed under the MIT License — see
[LICENSE](LICENSE). Keep the licence as it is; don't relicense without asking.
