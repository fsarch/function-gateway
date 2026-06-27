# Function Gateway

A NestJS-based API service for managing and executing remote functions via worker servers.

## Features

- **Function Management**: Store worker server URLs and function UUIDs in a database
- **Function Execution**: Execute functions via the worker server API
- **REST API**: CRUD endpoints for managing functions and execution endpoints

## Prerequisites

- Node.js 20+
- PostgreSQL
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/fsarch/function-gateway.git
cd function-gateway

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your database in .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=function_gateway
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# With Docker
docker build -t function-gateway .
docker run -p 3000:3000 --env-file .env function-gateway
```

## Database Migrations

```bash
# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- --name=MigrationName

# Revert last migration
npm run migration:revert
```

## API Endpoints

### Functions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/functions` | Create a new function |
| GET | `/api/functions` | List all functions (with pagination) |
| GET | `/api/functions/:functionId` | Get a specific function |
| DELETE | `/api/functions/:functionId` | Delete a function |

### Execute Function

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/functions/:functionId/_actions/execute` | Execute a function via worker server |

### Request/Response Examples

#### Create Function

**Request:**
```json
{
  "workerServerUrl": "http://localhost:8082",
  "functionUuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "workerServerUrl": "http://localhost:8082",
  "functionUuid": "550e8400-e29b-41d4-a716-446655440000",
  "creationTime": "2024-01-01T00:00:00.000Z",
  "deletionTime": null
}
```

#### Execute Function

**Request:**
```json
{
  "arguments": ["arg1", "arg2"]
}
```

**Query Parameters:**
- `wait`: boolean (default: true) - Whether to wait for execution to complete

**Response:** (from worker server)
```json
{
  "executionId": "exec-123",
  "status": "completed",
  "result": { ... }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database username | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_DATABASE | Database name | function_gateway |
| DB_SSL | Enable SSL for database | false |
| PORT | Application port | 3000 |
| NODE_ENV | Node environment | development |

## Project Structure

```
function-gateway/
├── src/
│   ├── database/
│   │   ├── entities/
│   │   │   └── function.entity.ts
│   │   ├── migrations/
│   │   │   └── 1720373216668-function-table.ts
│   │   └── index.ts
│   ├── controllers/
│   │   └── function/
│   │       ├── function.controller.ts
│   │       ├── function.execute.controller.ts
│   │       ├── function.module.ts
│   │       └── function.service.ts
│   ├── models/
│   │   └── function/
│   │       ├── CreateFunctionDto.ts
│   │       ├── ExecuteFunctionDto.ts
│   │       └── FunctionDto.ts
│   ├── app.module.ts
│   └── main.ts
├── config/
│   └── typeorm.js
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
└── README.md
```

## License

UNLICENSED
