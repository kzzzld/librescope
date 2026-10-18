# Contributing

LibreScope takes contributions as pull requests on GitHub. Open one against
[`main`](https://github.com/kzzzld/librescope) and I'll review it there.

## Sending a change

1. Fork the repository and clone your fork:

   ```bash
   git clone git@github.com:<you>/librescope.git
   cd librescope
   ```

2. Branch, edit and commit:

   ```bash
   git checkout -b my-change
   # ... edit ...
   git commit -am "fix: correct the Debian parent"
   ```

3. Push the branch to your fork and open a pull request against `main`.

## How a change should look

Follow the same conventions the history already uses:

- One logical change per commit, with a conventional prefix: `feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`, `style:` or `test:`.
- Keep the subject line short; put the reasoning in the body if it needs explaining.
- Most changes are a data edit to `public/data.json`. Confirm it still parses
  before you open the pull request:

  ```bash
  node -e "JSON.parse(require('fs').readFileSync('public/data.json'))"
  ```

- Reach for `src/` only when the change genuinely isn't expressible as data. See
  [AGENTS.md](AGENTS.md) for the full conventions on data, themes, packaging and
  commits.

## Review

I read pull requests as they arrive and either merge them or reply with what to
change. A pull request is a conversation: push follow-up commits to the same
branch and they'll show up in the review. Once a change lands it becomes part of
the project's history.

## License

By contributing you agree your work is licensed under the MIT License — see
[LICENSE](LICENSE). Keep the licence as it is; don't relicense without asking.
