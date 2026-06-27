# Function Gateway - Requirements

## Overview
Function Gateway is a backend service that manages function registrations and triggers their execution on remote worker servers. It acts as an API Gateway that transforms HTTP requests into function calls, similar to AWS API Gateway with Lambda integration. The gateway provides authentication, authorization, and a unified interface to execute functions regardless of their physical location.

## Technical Stack
- **Framework**: NestJS 11
- **Language**: TypeScript (ES modules)
- **ORM**: TypeORM 1.0
- **Database**: PostgreSQL
- **HTTP Client**: Native `fetch` API
- **Validation**: class-validator, class-transformer
- **Authentication**: `@fsarch/server` with OIDC/JWT support
- **Authorization**: `@fsarch/server` UAC (User Access Control)

## Configuration
The application uses a `config/config.yml` file for all configuration. See the example file for the complete structure.

### Auth Configuration
- `auth.type`: Authentication type (e.g., `oidc`)
- `auth.discovery_url`: OIDC discovery endpoint URL
- `uac.type`: User Access Control type (e.g., `static`)
- `uac.users`: List of users with their permissions

### Function Worker Configuration
- `function_server.url`: URL of the function server
- `function_server.auth`: Authentication settings for function server communication
- `function_worker.url`: URL of the function worker
- `function_worker.auth`: Authentication settings for function worker communication

## Database Schema

### function_type
Stores types/categories of functions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key, auto-generated |
| name | varchar(256) | NO | Human-readable name, unique |
| external_id | varchar(256) | YES | System-wide unique identifier, unique |
| creation_time | timestamp with time zone | NO | Auto-generated on create |
| deletion_time | timestamp with time zone | YES | Soft delete timestamp |

**Initial Data:**
- id: `4da0a7eb-6b9a-48f7-ab92-b53c042258f0`, name: `HTTP`, external_id: `$system.http`

### function
Stores function registrations.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key, auto-generated |
| function_uuid | varchar(256) | NO | UUID of the function on the worker server |
| function_id | varchar(256) | NO | ID of the function (exposed in API) |
| external_id | varchar(256) | YES | Optional external identifier |
| function_type_id | uuid | YES | Foreign key to function_type |
| creation_time | timestamp with time zone | NO | Auto-generated on create |
| deletion_time | timestamp with time zone | YES | Soft delete timestamp |

**Foreign Keys:**
- `function_type_id` references `function_type(id)` with `ON DELETE SET NULL`

## API Endpoints

All endpoints require authentication via Bearer token (OIDC/JWT).

### Functions

#### Create Function
- **Endpoint**: `POST /functions`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "functionId": "abc-123"
  }
  ```
- **Response**: Created function entity
- **Status**: 201 Created

#### Execute Function
- **Endpoint**: `ANY /functions/:functionId/_actions/execute`
- **Auth**: Required
- **Method**: Accepts ALL HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- **Request Body**: Optional, passed through to function
- **Request Headers**: Forwarded to function as part of the arguments
- **Request Query Parameters**: Forwarded to function as part of the arguments
- **Query Parameters**: None
- **Response**: Execution result from worker server
- **Error Handling**: Returns 404 if function not found or execution fails
- **Note**: The Gateway transforms the HTTP request into a function call. The function receives a single argument object containing `method`, `headers`, `headerList`, `query`, and `queryList` representing the original HTTP request. The `wait` parameter is always set to `true`.

#### Get Function
- **Endpoint**: `GET /functions/:functionId`
- **Auth**: Required
- **Response**: Function entity
- **Status**: 200 OK

#### List Functions
- **Endpoint**: `GET /functions`
- **Auth**: Required
- **Query Parameters**:
  - `page`: number (default: 1) - page number
  - `pageSize`: number (default: 25) - items per page
- **Response**: Paginated array of function entities
- **Status**: 200 OK

#### Delete Function
- **Endpoint**: `DELETE /functions/:functionId`
- **Auth**: Required
- **Behavior**: Soft delete (sets deletion_time)
- **Status**: 200 OK

## Error Handling
- Use NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.)
- Return appropriate HTTP status codes
- Include descriptive error messages
- Propagate worker server errors with context
- Unauthorized requests return 401 Unauthorized

## Function Execution Flow
1. Client sends HTTP request to Function Gateway (any method: GET, POST, PUT, DELETE, etc.)
2. Gateway authenticates the request using OIDC/JWT
3. Gateway looks up function by ID in database
4. Gateway obtains an access token for the Function Worker using client credentials flow
5. Gateway transforms the HTTP request into a function call with arguments containing:
   - `method`: The HTTP method (GET, POST, etc.)
   - `headers`: Request headers as key-value object
   - `headerList`: Request headers as list of {key, value} pairs
   - `query`: Query parameters as key-value object
   - `queryList`: Query parameters as list of {key, value} pairs
6. Gateway sends the function call to the worker: `POST /v1/functions/{functionId}/executions?wait=true`
7. Gateway includes the access token in the `Authorization: Bearer` header
8. Gateway returns worker response to client
9. If execution fails, Gateway returns error with context

## Security Considerations
- All endpoints require authentication via `@fsarch/server` AuthGuard
- Access tokens for worker communication are obtained via OIDC client credentials flow
- Tokens are cached based on their expiration time (with 60 second buffer)
- Validate all input data
- Implement proper error handling to avoid information leakage

## Configuration Requirements
- `auth` section must be configured with valid OIDC provider
- `uac` section must define user permissions
- `function_worker` section must contain valid URL and auth credentials
- Database connection must be properly configured
