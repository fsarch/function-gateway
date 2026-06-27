# Function Gateway - Requirements

## Overview
Function Gateway is a backend service that manages function registrations and triggers their execution on remote worker servers. It provides a unified interface to execute functions regardless of their physical location.

## Technical Stack
- **Framework**: NestJS 11
- **Language**: TypeScript (ES modules)
- **ORM**: TypeORM 1.0
- **Database**: PostgreSQL
- **HTTP Client**: Native `fetch` API
- **Validation**: class-validator, class-transformer

## Database Schema

### function_type
Stores types/categories of functions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key, auto-generated |
| name | varchar(256) | NO | Human-readable name, unique |
| external_id | varchar(256) | NO | System-wide unique identifier |
| creation_time | timestamp with time zone | NO | Auto-generated on create |
| deletion_time | timestamp with time zone | YES | Soft delete timestamp |

**Initial Data:**
- id: `4da0a7eb-6b9a-48f7-ab92-b53c042258f0`, name: `HTTP`, external_id: `$system.http`

### function
Stores function registrations.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key, auto-generated |
| worker_server_url | varchar(1024) | NO | Base URL of the worker server |
| function_uuid | varchar(256) | NO | UUID of the function on the worker |
| external_id | varchar(256) | YES | Optional external identifier |
| function_type_id | uuid | YES | Foreign key to function_type |
| creation_time | timestamp with time zone | NO | Auto-generated on create |
| deletion_time | timestamp with time zone | YES | Soft delete timestamp |

**Foreign Keys:**
- `function_type_id` references `function_type(id)` with `ON DELETE SET NULL`

## API Endpoints

### Functions

#### Create Function
- **Endpoint**: `POST /functions`
- **Request Body**:
  ```json
  {
    "workerServerUrl": "https://worker.example.com",
    "functionUuid": "abc-123"
  }
  ```
- **Response**: Created function entity

#### Execute Function
- **Endpoint**: `POST /functions/:functionId/_actions/execute?wait=true`
- **Request Body**:
  ```json
  {
    "arguments": ["arg1", "arg2"]
  }
  ```
- **Query Parameters**:
  - `wait`: boolean (default: true) - whether to wait for execution completion
- **Response**: Execution result from worker server
- **Error Handling**: Returns 404 if function not found or execution fails

#### Get Function
- **Endpoint**: `GET /functions/:functionId`
- **Response**: Function entity

#### List Functions
- **Endpoint**: `GET /functions`
- **Response**: Array of function entities

#### Delete Function
- **Endpoint**: `DELETE /functions/:functionId`
- **Behavior**: Soft delete (sets deletion_time)

## Error Handling
- Use NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.)
- Return appropriate HTTP status codes
- Include descriptive error messages
- Propagate worker server errors with context

## Function Execution Flow
1. Client sends execution request to Function Gateway
2. Gateway looks up function by ID in database
3. Gateway forwards request to worker server at `workerServerUrl`
4. Worker server endpoint: `POST /v1/functions/{functionUuid}/executions?wait={wait}`
5. Gateway returns worker response to client
6. If execution fails, Gateway returns error with context

## Security Considerations
- Validate all input data
- Sanitize worker server URLs
- Implement proper error handling to avoid information leakage
- Consider adding authentication/authorization in future

## Future Enhancements
- Add authentication and authorization
- Implement rate limiting
- Add function versioning
- Support for different function types beyond HTTP
- Metrics and monitoring integration
- Retry logic for failed executions
- Caching of function lookups
