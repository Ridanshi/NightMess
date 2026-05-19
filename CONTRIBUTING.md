# Contributing to NightMess

Thank you for taking the time to contribute! This document explains how to get involved effectively.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

Be respectful. Contributions of all kinds are welcome — code, documentation, bug reports, and design improvements.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/NightMess.git
   cd NightMess
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/Ridanshi/NightMess.git
   ```

---

## Development Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and other values
npm run dev
```

### Frontend

```bash
cd my_app
npm install
npm start
```

Both services must be running simultaneously. The frontend proxies API calls to `http://localhost:5000`.

---

## How to Contribute

### Good First Issues

Look for issues labelled `good first issue` — these are well-scoped tasks suitable for new contributors.

### Picking up an Issue

Before starting work, comment on the issue to let others know you're working on it. This prevents duplicate effort.

### Making Changes

1. Sync with upstream before starting:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes.
4. Test your changes locally (both backend and frontend).
5. Commit and push.

---

## Branch Naming

Use the following prefixes:

| Prefix | Purpose |
|--------|---------|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation updates |
| `refactor/` | Code improvements with no functional change |
| `chore/` | Build scripts, dependencies, tooling |

Examples: `feature/order-notifications`, `fix/cart-quantity-bug`

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat: add vendor order ETA update endpoint
fix: resolve cart quantity sync on page reload
docs: update environment variable setup guide
```

---

## Pull Request Process

1. Open a PR against the `main` branch.
2. Fill out the PR template completely.
3. Ensure your code does not break existing functionality.
4. Keep PRs focused — one feature or fix per PR.
5. A maintainer will review and may request changes.
6. Once approved, the PR will be merged.

---

## Reporting Bugs

Use the **Bug Report** issue template. Include:

- Steps to reproduce
- Expected vs. actual behavior
- Browser/Node.js version
- Console errors or screenshots if applicable

---

## Suggesting Features

Use the **Feature Request** issue template. Include:

- The problem the feature solves
- How you envision it working
- Any alternatives you considered

---

## Project Structure Quick Reference

```
backend/index.js        — all API routes, schemas, and server setup
my_app/src/components/  — React components organized by role (admin/vendor/client)
my_app/src/App.js       — routing and context providers
```

---

Thank you for contributing to NightMess!
