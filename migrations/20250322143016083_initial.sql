BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_id INTEGER NOT NULL,
    github_username TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    location TEXT,
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_github_id_idx ON users (github_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_github_username_idx ON users (github_username);

COMMIT;