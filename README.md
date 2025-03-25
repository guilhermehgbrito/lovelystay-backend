# LovelyStay Backend

## Table of Contents

- [Setup](#setup)
  - [Pnpm (recommended)](#pnpm-recommended)
  - [NPM](#npm)
  - [Docker](#docker)
    - [pgAdmin](#pgadmin)
    - [Database](#database)
  - [Environment Variables](#environment-variables)
  - [Running the migrations](#running-the-migrations)
  - [Running the CLI](#running-the-cli)
  - [How to use the CLI](#how-to-use-the-cli)
    - [Fetching information about a given GitHub user](#fetching-information-about-a-given-github-user)
    - [Listing users](#listing-users)
        - [Filtering users](#filtering-users)
        - [Pagination](#pagination)
        - [Output types](#output-types)
    - [Fetching repositories](#fetching-repositories)
  - [Running the tests](#running-the-tests)
    - [Unit tests](#unit-tests)
    - [E2E tests](#e2e-tests)
- [Requirements](#requirements)
  - [Coding Test Requirements](#coding-test-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non-functional requirements](#non-functional-requirements)

## Setup

### Pnpm (recommended)

If you don't have pnpm installed, you can install it by following the instructions [here](https://pnpm.io/installation).

```bash
pnpm install
```

<!-- TOC --><a name="npm"></a>
### NPM

```bash
npm install
```

<!-- TOC --><a name="docker"></a>
### Docker

To ease the setup of the database, you can use Docker Compose.

If you don't have Docker installed, you can install it by following the instructions [here](https://docs.docker.com/get-docker/).

```bash
docker compose up -d
```

<!-- TOC --><a name="pgadmin"></a>
#### pgAdmin

This will start the PostgreSQL database and the pgAdmin container.

You can access pgAdmin at [http://localhost:5050](http://localhost:5050).

The default credentials are:

- Email: `pgadmin@pgadmin.org`
- Password: `pgadmin`

You can change the credentials by editing the `docker-compose.yml` file.

<!-- TOC --><a name="database"></a>
#### Database

The database will be available at `localhost:5432`.

The default credentials are:

- Username: `postgres`
- Password: `postgres`
- Database: `postgres`

You can change the credentials by editing the `docker-compose.yml` file.

<!-- TOC --><a name="environment-variables"></a>
### Environment Variables

The environment variables are stored in the `.env` file.

You can create your own `.env` file by using the `.env.example` file as a template.

Only `DATABASE_URL` is required.

The other variables are optional and are used to configure the GitHub API or logging.

If you don't provide them, the CLI will use the default values.

<!-- TOC --><a name="running-the-migrations"></a>
### Running the migrations

The migrations are stored in the `migrations` directory, and run automatically when the Docker container is started.

You can also run the migrations manually using the following command:

```bash
pnpm run migrations up
```

Remember to run migrations from the root of the project.

<!-- TOC --><a name="running-the-cli"></a>
### Running the CLI

The CLI is the main entry point for the application.

There are three ways to run it:

1. `pnpm run build` and then `node --env-file=.env dist/main.js` (equivalent to `pnpm start`)
2. `pnpm run start:dev` to run the CLI in development mode
3. `pnpm run start:debug` to run the CLI in debug mode

You can pass the `--help` flag to get more information about the available commands and options.


<!-- TOC --><a name="how-to-use-the-cli"></a>
### How to use the CLI

The CLI is a command-line tool that allows you to fetch information about a given GitHub user and store it on the database.

<!-- TOC --><a name="fetching-information-about-a-given-github-user"></a>
#### Fetching information about a given GitHub user

To fetch information about a given GitHub user, you can use the following command:

```bash
pnpm run start user <username>
```

This will fetch the information about the given GitHub user and store it on the database. You can pass the flag `--force` to force the fetching of the information even if the user already exists on the database.

<!-- TOC --><a name="listing-users"></a>
#### Listing users

To list all users, you can use the following command:

```bash
pnpm run start user list
```

This will list all users stored on the database.

<!-- TOC --><a name="filtering-users"></a>
##### Filtering users

You can use the flag `--location` to filter the users by location.

For example, to list all users from a given location, you can use the following command:

```bash
pnpm run start user list --location=<location>
```

You can also use the flag `--languages` to filter the users by programming language.

For example, to list all users who know a given programming language, you can use the following command:

```bash
pnpm run start user list --languages=<language> <language2> <language3>
```

You can also combine the flags to filter the users by location and programming language.

For example, to list all users who know a given programming language and are from a given location, you can use the following command:

```bash
pnpm run start user list --languages=<language> --location=<location>
```

All the filters are optional, so you can use them individually or together.

<!-- TOC --><a name="pagination"></a>
##### Pagination

Pagination is also supported, so you can use the flag `--page` to get the users from a given page.

For example, to get the users from the second page, you can use the following command:

```bash
pnpm run start user list --page=2
```

The default page is 1.

You can also use the flag `--limit` to change the limit of users per page.

For example, to get 100 users per page, you can use the following command:

```bash
pnpm run start user list --limit=100
```

The default limit is 20.

<!-- TOC --><a name="output-types"></a>
##### Output types

You can use the flag `--output-type` to change the output type.

For example, to get the output in JSON format, you can use the following command:

```bash
pnpm run start user list --output-type=json
```

The default output type is `json`.

<!-- TOC --><a name="fetching-repositories"></a>
#### Fetching repositories

To fetch repositories from a given user, you can use the following command:

```bash
pnpm run start repo pull <username>
```

This will fetch the repositories from the given GitHub user and store them on the database.

<!-- TOC --><a name="running-the-tests"></a>
### Running the tests

Unit tests are defined under `__tests__` directories and are executed by Jest.

To add mocks, you can leverage the `jest.mock` function, and the auto-mocking feature of Jest, which it is done when a file is put under `__mocks__` directory, on the same level as the file you want to mock.

See the [Jest documentation](https://jestjs.io/docs/manual-mocks#mocking-user-modules) for more information.

<!-- TOC --><a name="unit-tests"></a>
#### Unit tests

To run the unit tests, you can use the following command:

```bash
pnpm run test
```

This will run the tests in the all `__tests__` directories.

<!-- TOC --><a name="e2e-tests"></a>
#### E2E tests

To run the E2E tests, you should have the Docker Compose file `docker-compose.e2e.yml` running.

For that, you can use the following command:

```bash
docker compose -f docker-compose.e2e.yml up -d  --abort-on-container-exit
```

The flag `--abort-on-container-exit` is used to stop the database when the tests are finished.


<!-- TOC --><a name="requirements"></a>
## Requirements

<!-- TOC --><a name="coding-test-requirements"></a>
### Coding Test Requirements

- [X] RQ1: All async functions must be composable, meaning you can call them in sequence without asynchronicity issues;
- [X] RQ2: You shall have one main function and you should avoid process.exit() calls to the bare minimum;
- [X] RQ3: You must not use classes, as it is not justified for such a small app (we use almost no classes on our code);
- [X] RQ4: Your code must be safe, assume all input strings as insecure and avoid SQL injections;
- [X] RQ5: Each line shall not exceed 80 characters (bonus points if you include/follow some eslint rules), and it should use 2 spaces instead of tabs;
- [X] RQ6: You must use NodeJS, TypeScript, and PostgreSQL;
- [X] RQ7: You should setup the database using migrations, if possible (preferably using SQL, but not mandatory) - feel free to use external tools or libraries for this purpose;
- [X] RQ8: Code should be split into database functions and general processing functions, when possible;
- [X] RQ9: For database access, you must use this library: https://github.com/vitaly-t/pg-promise
- [X] RQ10: For the processing (business logic) functions you should use either native ES6 functions or the library https://ramdajs.com/docs/ (or both);

<!-- TOC --><a name="functional-requirements"></a>
### Functional Requirements

- [X] FR1: User should be able to fetch information about a given GitHub user (passed as a command-line argument) using the [GitHub API](https://docs.github.com/en/rest), and store it on one or more database tables, and be able to display the information on the command line;
- [X] FR2: User should be able to fetch and display all users already on the database (showing them on the command line);
- [X] FR3: User should be able to list users only from a given location (again, using a command-line option);
- [X] FR4: User should be able to query users by programming language(s), with optional location (again, using command-line options);

<!-- TOC --><a name="non-functional-requirements"></a>
### Non-functional requirements

- [X] NFR1: The CLI should present a help menu with all the available commands and their options;
- [X] NFR2: The CLI should be able to handle errors and edge cases gracefully;
- [X] NFR3: Display output should be human-readable and easy to understand;
- [X] NFR4: The CLI should be configurable via environment variables and/or command-line arguments (e.g. `GITHUB_API_KEY`, `DATABASE_URL`, etc.);
- [X] NFR5: The code should be well-documented with JSDoc;
- [X] NFR6: The code should be tested with Jest (unit, and E2E);
- [X] NFR7: The repository should have a how-to-use guide;
- [X] NFR8: Code should follow established linting and formatting rules;