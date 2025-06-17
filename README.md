# DBB Test Task

## Project Setup

```bash
# Clone repository
git clone https://github.com/sxlwrl/dbb-test-task.git
cd dbb-test-task

# Run project with Docker
docker-compose up -d --build

# Or setup locally

# Install dependencies
npm install
npm run start:dev
```

**API** `http://localhost:3000` <br/>
**Swagger Docs** `http://localhost:3000/api`

## Project Architecture

### Stack
- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Swagger
- Docker
- Jest

### Architecture overview

The system was built as a monolith application, following a modular structure. The core modules will be described below.

The main layers are: *controllers*, *services*, *repositories*.
There are also *DTOs* and *Validation Pipes* to validate the request fields.

- **Controllers**: Handles HTTP requests, delegates business logic to services and returns responses.
- **Services**: Contain the core business logic, throws data to repositories.
- **Repositories**: Abstract database access, using ORM for data manipulation.
- **DTOs**: Defines the structure and validation rules for incoming request body data.
- **Validation Pipes**: Uses to convert and validate query or parameter data.

### Modules

#### *1. Company module*
Company module is responsible for managing company entities within the system. It provides some CRUD (Create, Read) operations for companies and exposes API endpoints for interaction with company data.

#### *2. Staff module*
Staff module is accountable for aspects of staff management. It supports the creation and management of staff, including the assignment of supervisor. Staff members are classified by roles and the module implements dynamic salary calculations at an arbitrary time.

### Calculation algorithm

**1.** The client sends a request to the endpoint (/staff/:id/salary), optionally specifying a date. <br/>
**2.** The controller receives the request, validates the input and delegates calculation to the service layer. <br/>
**3.** The service retrieves the staff member's data from the controller, passes the information to the repository, receives staff member object from that repository. <br/>
**4.** The system selects calculator based on the staff member's role (Employee, Manager, Sales) <br/>
**4.1.** If it is Employee - just calculates the salary <br/>
**4.2.** If it is Manager - calculates the salary and uses `getSalary` function, which calculates salaries of the first level subordinates <br/>
**4.3.** If it is Sales - calculates the salary and uses `getAllSubordinateSalaries` function, which recursively calculates the salary of all subordinates <br/>

### Database Structure

This describes the main entities and relationships in the database.

***Company***

| Field | Type  | Constraints         |
|-------|-------|---------------------|
| id    | UUID  | Primary Key         |
| name  | String  | Unique  |


***StaffMember***

| Field        | Type   | Constraints                                |
|--------------|--------|---------------------------------------------|
| id           | UUID   | Primary Key                                 |
| name         | String   | Unique                           |
| joinedAt     | DateTime   |                              |
| baseSalary   | Int    |                                  |
| type         | Enum   | [EMPLOYEE, MANAGER, SALES]              |
| companyId    | UUID   | Foreign Key                      |
| supervisorId | UUID   | Self-referencing Foreign Key   |


***StaffType (enum)***

| Value     | Description         |
|-----------|---------------------|
| EMPLOYEE  | Regular employee    |
| MANAGER   | Manager role        |
| SALES     | Sales role          |

**Relationships:**

- One ***Company*** has many ***StaffMember*** (1:N)
- Each ***StaffMember*** belongs to one ***Company*** (N:1)
- Each ***StaffMember*** can have one supervisor (self-referencing N:1)
- Each ***StaffMember*** can supervise many staff members (self-referencing 1:N)
- No duplicate staff names within a company ([`companyId`, `name`])

## Advantages

- Easy to maintain and deploy
- Clear modularity
- Easy to extend business logic within a single codebase
- All business logic is in one place
- Single database can be used

## Drawbacks

- Difficult to scale horizontally
- High dependency between modules
- High vulnerability to disruption
- Potential performance issues
- Depends on one deployment (single point of failure)

## Improvement ideas

- Implement authentication and authorization
- Implement logging
- Set up CI/CD (for example GitHub Actions)
- Implement integration testing
