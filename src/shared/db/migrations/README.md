# Database Migrations

This directory contains migrations for the Dexie.js database. Migrations are used to change the database schema and ensure data compatibility when updating the application.

## Directory Structure

- `migration_XXX.ts`: Migration files where `XXX` is a three-digit version number (e.g., `migration_001.ts`).
- `index.ts`: The migration registry that exports all migrations in the correct order.

## How to Create a New Migration

When adding or modifying a table, follow these steps:

### 1. Update Models

- Add or modify interfaces in `db/models` to reflect the new or changed schema.

### 2. Create a New Migration File

- Create a new migration file, e.g., `migration_004.ts`.
- Include the new or modified schema in `stores`.
- If necessary, add data migration logic in the `upgrade` function.

### 3. Update the Migration Registry

- Add the new migration to `migrations/index.ts`.

### 4. Update the Dexie Database Class

- Add the new table to the database class `db.ts`.

### 5. Use the New Table in Your Code

- Work with the new table in your application code.

## Recommendations

- **File Naming Conventions**: Use consistent zero-padded numbering.
- **Do Not Modify Existing Migrations**: After a migration has been applied, do not change it.
- **Update Schemas for All Tables**: Include all tables in `stores`.
- **Ensure Compatibility**: Verify that changes are compatible with existing data.
- **Document Changes**: Add comments in migration files if needed.

## Troubleshooting

- **Version Errors**: Check the sequence of version numbers.
- **Schema Conflicts**: Ensure table schemas are up to date.
- **Data Issues**: Review the logic in the `upgrade` function.

## Version Control

- **Commits**: Make separate commits for each migration.
- **Code Reviews**: Conduct code reviews of migrations.
