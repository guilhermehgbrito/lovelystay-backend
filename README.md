# lovelystay-backend

## Requirements

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

### Functional Requirements

- [X] FR1: User should be able to fetch information about a given GitHub user (passed as a command-line argument) using the [GitHub API](https://docs.github.com/en/rest), and store it on one or more database tables, and be able to display the information on the command line;
- [X] FR2: User should be able to fetch and display all users already on the database (showing them on the command line);
- [ ] FR3: User should be able to list users only from a given location (again, using a command-line option);
- [ ] FR4: User should be able to query users by programming language(s), with optional location (again, using command-line options);

### Non-functional requirements

- [X] NFR1: The CLI should present a help menu with all the available commands and their options;
- [X] NFR2: The CLI should be able to handle errors and edge cases gracefully;
- [X] NFR3: Display output should be human-readable and easy to understand;
- [X] NFR4: The CLI should be configurable via environment variables and/or command-line arguments (e.g. `GITHUB_API_KEY`, `DATABASE_URL`, etc.);
- [X] NFR5: The code should be well-documented with JSDoc;
- [ ] NFR6: The code should be tested with Jest (unit, integration, and E2E);
- [ ] NFR7: The repository should have a how-to-use guide;
- [X] NFR8: Code should follow established linting and formatting rules;
