# Agent Guidelines for Function Gateway

## Project Overview
Function Gateway is a NestJS application that manages and executes remote functions via worker servers. It uses TypeORM with PostgreSQL for data persistence.

## General Rules

### Code Style
- Follow existing code style and patterns in the repository
- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use `!` (definite assignment assertion) for TypeORM entity properties
- Use `camelCase` for variables and functions, `PascalCase` for classes and types
- Use `snake_case` for database column names

### File Organization
- Entities: `src/database/entities/`
- Migrations: `src/database/migrations/`
- Controllers: `src/controllers/`
- Services: `src/services/` or alongside controllers
- DTOs: `src/models/`
- Configuration: `config/`

### TypeORM
- Always update both entity and migration files when changing the database schema
- Use `uuid` for primary keys with `gen_random_uuid()` as default
- Include `creation_time` and `deletion_time` timestamps in all entities
- Use `snake_case` for column names, `camelCase` for property names
- Add `!` to all entity properties for definite assignment

### Migrations
- Create new migration files for schema changes
- Use TypeORM migration classes (`MigrationInterface`, `QueryRunner`)
- Prefer TypeORM methods over raw SQL where possible
- Combine related changes in a single migration when appropriate
- Always implement both `up()` and `down()` methods

### API Design
- Use RESTful conventions for endpoints
- Prefix function routes with `/functions`
- Use query parameters for optional flags (e.g., `?wait=true`)
- Return appropriate HTTP status codes
- Use NestJS exception filters for error handling

### HTTP Client
- Use native `fetch` API instead of Axios
- Always set `Content-Type: application/json` header for JSON requests
- Handle both success and error responses appropriately
- Type response data when possible

## Testing
- Place test files alongside the code they test with `.spec.ts` suffix
- Use Jest as the test framework
- Test both success and error paths
- Mock external dependencies

## Commands
- Build: `npm run build`
- Start dev: `npm run start:dev`
- Run migrations: `npm run migration:run`
- Generate migrations: `npm run migration:generate`
- Create migrations: `npm run migration:create`
- Lint: `npm run lint`
- Test: `npm run test`
