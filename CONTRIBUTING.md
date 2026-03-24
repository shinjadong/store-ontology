# Contributing to Store Ontology

Thank you for your interest in contributing to Store Ontology. This guide covers the main contribution patterns.

---

## Development Setup

```bash
# Prerequisites: Node.js 22+, pnpm 9+
git clone https://github.com/your-org/store-ontology.git
cd store-ontology
pnpm install

# Verify everything works
pnpm run typecheck   # tsc --noEmit for all packages
pnpm test            # vitest run for packages with tests
pnpm build           # tsc build for all packages
```

The project uses a monorepo structure managed by pnpm workspaces and Turborepo. All packages live under `packages/`.

---

## How to Add a New Connector

Connectors live in `packages/connector-{name}/`. Every connector implements the `Connector<TRaw, TEntity>` interface from `@store-ontology/core`.

### Step 1: Scaffold the package

```bash
mkdir -p packages/connector-myapi/src/__tests__
```

Create `packages/connector-myapi/package.json`:

```json
{
  "name": "@store-ontology/connector-myapi",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@store-ontology/core": "workspace:*",
    "zod": "^3.24"
  },
  "devDependencies": {
    "typescript": "^5.7",
    "vitest": "^3.2"
  },
  "license": "MIT"
}
```

Create `packages/connector-myapi/tsconfig.json` that extends the base config:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### Step 2: Define raw types

Create `src/types.ts` with the raw API response shape:

```typescript
export interface MyApiRawResponse {
  // Fields matching the external API response
}
```

### Step 3: Implement the connector

Create `src/connector.ts`:

```typescript
import { z } from "zod";
import type { Connector, ConnectorConfig, ConnectorResult } from "@store-ontology/core";
import type { MyApiRawResponse } from "./types.js";

// Define the Zod schema for the mapped entity
export const MyEntitySchema = z.object({
  // Fields matching the target ontology table
});

export type MyEntity = z.infer<typeof MyEntitySchema>;

export class MyApiConnector implements Connector<MyApiRawResponse, MyEntity> {
  readonly config: ConnectorConfig = {
    name: "My API Connector",
    version: "0.1.0",
    sourceSystem: "my-api",
  };

  map(raw: MyApiRawResponse): MyEntity {
    // Transform raw data to ontology entity
  }

  async fetch(params: Record<string, unknown>): Promise<ConnectorResult<MyEntity>> {
    // Call external API, map, return result
  }

  validate(entity: MyEntity): boolean {
    return MyEntitySchema.safeParse(entity).success;
  }
}
```

### Step 4: Export from index

Create `src/index.ts`:

```typescript
export { MyApiConnector, MyEntitySchema } from "./connector.js";
export type { MyEntity } from "./connector.js";
export type { MyApiRawResponse } from "./types.js";
```

### Step 5: Write tests

Create `src/__tests__/connector.test.ts` with at least a `map()` unit test.

---

## How to Add a New Object Type

Object Types are Drizzle table definitions that live in `packages/schema/src/tables/`.

### Step 1: Create the table definition

Create `packages/schema/src/tables/my-entity.ts`:

```typescript
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { stores } from "./store";

export const myEntities = pgTable(
  "my_entities",
  {
    myEntityId: uuid("my_entity_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    // Add your fields here
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("my_entities_store_idx").on(t.storeId)]
);
```

### Step 2: Export from the tables index

Add the export to `packages/schema/src/tables/index.ts`:

```typescript
export { myEntities } from "./my-entity";
```

### Step 3: Define relations

Add relations in `packages/schema/src/relations.ts` following the existing patterns.

### Step 4: Add corresponding enums

If your entity introduces new enum values, add them to `packages/core/src/enums.ts` as Zod schemas.

### Step 5: Re-export from package index

Update `packages/schema/src/index.ts` to export the new table and relations.

---

## Naming Conventions

This project follows Palantir Foundry naming rules:

| Element | Convention | Example |
|---------|-----------|---------|
| Object Type (table export) | camelCase plural | `insurancePolicies` |
| Table name (SQL) | snake_case plural | `insurance_policies` |
| Column name (SQL) | snake_case | `monthly_fee` |
| Property name (TypeScript) | camelCase | `monthlyFee` |
| Enum values | SCREAMING_SNAKE_CASE | `INDIVIDUAL_TAXABLE` |
| Connector class | PascalCase + "Connector" | `NiceVanConnector` |

---

## Commit Message Conventions

Use conventional commits:

```
feat: add connector for KCP VAN API
fix: correct check digit calculation for BRN validation
docs: update connector pattern example in README
refactor: extract common fetch logic to base connector
test: add edge cases for business number parser
chore: bump drizzle-orm to 0.39
```

Format: `<type>: <short description>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`

---

## Pull Request Process

1. Create a feature branch from `master`
2. Make your changes with tests
3. Ensure `pnpm run typecheck` and `pnpm test` pass
4. Open a PR with a clear description of what changed and why
