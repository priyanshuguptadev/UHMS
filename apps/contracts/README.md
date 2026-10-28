# UHMS Contracts

Smart contracts for UHMS (University Hostel Management System) using Hardhat 3, Viem, and Ganache.

## Project Structure

```
contracts/        Solidity source files (UHMS.sol)
scripts/          Deployment scripts using Viem (deploy.ts)
hardhat.config.ts Hardhat 3 configuration
```

## Available Scripts

### Start Ganache (Local Ethereum Node)

Start the local Ganache node on `http://127.0.0.1:8545`:

```bash
pnpm run ganache
```

### Build & Compile Contracts

```bash
pnpm run build
# or
pnpm run compile
```

### Deploy to Ganache

Ensure Ganache is running, then deploy using Viem:

```bash
pnpm run deploy
# or
pnpm run deploy:ganache
```
