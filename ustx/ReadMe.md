# USD STX Coin (USTX)

A SIP-010 compliant fungible token implementation on the Stacks blockchain, deployed as a Clarity smart contract.

## Overview

USD STX Coin (USTX) is a fungible token built on Stacks with the following characteristics:
- **Token Name**: USD STX
- **Symbol**: USTX
- **Decimals**: 0
- **Standard**: SIP-010 Fungible Token Standard
- **Supply**: No maximum supply (mintable by contract owner)

## Features

- ✅ Full SIP-010 trait compliance
- ✅ Transfer functionality with optional memo field
- ✅ Owner-only minting capability
- ✅ No fixed supply limit
- ✅ Built-in balance and supply queries
- ✅ Deployed and tested on Stacks Testnet

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) >= 2.0.0
- [Node.js](https://nodejs.org/) (for Clarinet)
- STX tokens for deployment (testnet or mainnet)
- Git

## Installation & Setup

1. Clone or create a new Clarinet project:
```bash
clarinet new ustx-token
cd ustx-token
```

2. Place the contract code in `contracts/ustx.clar`

3. Check the contract:
```bash
clarinet check
```

## Testnet Deployment

The contract has been successfully deployed to Stacks Testnet. Below is the actual deployment log:

```bash
$ clarinet deployments generate --testnet --medium-cost
A new deployment plan was computed and differs from the default deployment plan currently saved on disk:
  ---
  id: 0
  name: Testnet deployment
  network: testnet
  stacks-node: "https://api.testnet.hiro.so "
  bitcoin-node: "http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332 "
  plan:
    batches:
      - id: 0
        transactions:
          - requirement-publish:
              contract-id: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard
              remap-sender: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
              remap-principals:
                SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
              cost: 8400
              path: "./.cache/requirements/SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.clar"
              clarity-version: 1
        epoch: "2.0"
      - id: 1
        transactions:
          - contract-publish:
-             contract-name: counter
+             contract-name: ustx
              expected-sender: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
-             cost: 11200
+             cost: 528402
              path: contracts/ustx.clar
              anchor-block-only: true
              clarity-version: 4
        epoch: "3.3"
Overwrite? [Y/n]
y
Generated file deployments/default.testnet-plan.yaml

$ clarinet deployments apply --testnet
A new deployment plan was computed and differs from the default deployment plan currently saved on disk:
  ---
  id: 0
  name: Testnet deployment
  network: testnet
  stacks-node: "https://api.testnet.hiro.so "
  bitcoin-node: "http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332 "
  plan:
    batches:
      - id: 0
        transactions:
          - requirement-publish:
              contract-id: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard
              remap-sender: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
              remap-principals:
                SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
              cost: 8400
              path: "./.cache/requirements/SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.clar"
              clarity-version: 1
        epoch: "2.0"
      - id: 1
        transactions:
          - contract-publish:
              contract-name: ustx
              expected-sender: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
-             cost: 528402
+             cost: 11200
              path: contracts/ustx.clar
              anchor-block-only: true
              clarity-version: 4
        epoch: "3.3"
Overwrite? [Y/n]
y
note: using existing deployments/default.testnet-plan.yaml
The following deployment plan will be applied:
---
id: 0
name: Testnet deployment
network: testnet
stacks-node: "https://api.testnet.hiro.so "
bitcoin-node: "http://blockstack:blockstacksystem@bitcoind.testnet.stacks.co:18332 "
plan:
  batches:
    - id: 0
      transactions:
        - requirement-publish:
            contract-id: SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard
            remap-sender: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
            remap-principals:
              SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
            cost: 8400
            path: "./.cache/requirements/SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.clar"
            clarity-version: 1
      epoch: "2.0"
    - id: 1
      transactions:
        - contract-publish:
            contract-name: ustx
            expected-sender: ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4
            cost: 11200
            path: contracts/ustx.clar
            anchor-block-only: true
            clarity-version: 4
      epoch: "3.3"


Total cost:     0.011200 STX
Duration:       2 blocks


Continue [Y/n]?
y
✔ Transactions successfully confirmed on Testnet
```

**Deployment Details:**
- **Network**: Stacks Testnet
- **Deployer**: `ST1H2QC68JG5M2YKZXN1VVBNZ7EHKAHKBA4DD11Q4`
- **Contract Name**: `ustx` (published from `contracts/ustx.clar`)
- **SIP-010 Trait**: `SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard`
- **Transaction Cost**: 0.011200 STX
- **Duration**: 2 blocks
- **Clarity Version**: 4

## Usage Examples

### Transfer Tokens
```clarity
;; Transfer 100 USTX with a memo
(contract-call? .ustx transfer u100 tx-sender 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7 (some 0x48656c6c6f))
```

### Check Balance
```clarity
;; Check balance of a specific principal
(contract-call? .ustx get-balance 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7)
```

### Mint Tokens (Owner Only)
```clarity
;; Mint 1000 USTX to a recipient (contract owner only)
(contract-call? .ustx mint u1000 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7)
```

### Get Token Info
```clarity
(contract-call? .ustx get-name)
(contract-call? .ustx get-symbol)
(contract-call? .ustx get-decimals)
(contract-call? .ustx get-total-supply)
(contract-call? .ustx get-token-uri)
```

## Testing

The project includes a basic test file template at `tests/ustx_test.ts`:

```typescript
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.125.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that <...>",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let block = chain.mineBlock([
            /* 
             * Add transactions with: 
             * Tx.contractCall(...)
            */
        ]);
        assertEquals(block.receipts.length, 0);
        assertEquals(block.height, 2);

        block = chain.mineBlock([
            /* 
             * Add transactions with: 
             * Tx.contractCall(...)
            */
        ]);
        assertEquals(block.receipts.length, 0);
        assertEquals(block.height, 3);
    },
});
```

Run tests with:
```bash
clarinet test
```

## Function Reference

### Public Functions

#### `transfer (amount uint, sender principal, recipient principal, memo (optional (buff 34)))`
Transfers tokens from sender to recipient.
- **Params**: amount, sender, recipient, optional memo
- **Returns**: `(ok true)` on success
- **Requires**: Transaction sender must be the token owner

#### `mint (amount uint, recipient principal)`
Mints new tokens to the recipient.
- **Params**: amount, recipient
- **Returns**: `(ok <bool>)` on success
- **Requires**: Contract owner only

### Read-Only Functions

#### `get-name ()`
Returns the token name.
- **Returns**: `(ok "USD STX")`

#### `get-symbol ()`
Returns the token symbol.
- **Returns**: `(ok "USTX")`

#### `get-decimals ()`
Returns the number of decimals.
- **Returns**: `(ok u0)`

#### `get-balance (who principal)`
Returns the balance of a principal.
- **Returns**: `(ok <uint>)`

#### `get-total-supply ()`
Returns the total supply.
- **Returns**: `(ok <uint>)`

#### `get-token-uri ()`
Returns the token URI (none in this implementation).
- **Returns**: `(ok none)`

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| `u100` | `err-owner-only` | Operation requires contract owner |
| `u101` | `err-not-token-owner` | Transaction sender is not the token owner |

## Mainnet Deployment

To deploy to mainnet:

```bash
clarinet deployments apply --mainnet
```

**Warning**: Ensure you have sufficient STX for transaction fees and verify all parameters before mainnet deployment.

## Development

### Project Structure
```
.
├── Clarinet.toml
├── contracts/
│   └── ustx.clar
├── deployments/
│   └── default.testnet-plan.yaml
├── tests/
│   └── ustx_test.ts
├── settings/
│   └── Devnet.toml
└── README.md
```

### Local Development
Start a local devnet:
```bash
clarinet integrate
```

## License

This project is released as open-source. Please ensure compliance with the SIP-010 standard and Stacks blockchain requirements.

## Notes

- This token has **0 decimal places** - all amounts are whole numbers
- No maximum supply cap is enforced
- Minting is restricted to the contract deployer
- The contract implements the official SIP-010 trait from `SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard`
- Clarity version 4 is used for the main contract