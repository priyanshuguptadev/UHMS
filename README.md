# UHMS Monorepo

PNPM workspace monorepo containing 2 Node.js applications.

## Workspace Structure

```
├── apps/
│   ├── contracts/       # Hardhat v3
│   └── web/            # Next.js 16
├── packages/            # Shared packages (optional)
├── package.json         # Workspace root configuration
├── pnpm-workspace.yaml  # PNPM workspace definition
└── .gitignore
```

## Getting Started

### Install dependencies
```bash
pnpm install
```

### Run both apps concurrently
```bash
# In production mode
pnpm start

# In watch/dev mode
pnpm dev
```

### Run individual apps
```bash
# Run app1
pnpm --filter @uhms/app1 dev

# Run app2
pnpm --filter @uhms/app2 dev
```
