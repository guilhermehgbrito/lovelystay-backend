BEGIN;

CREATE TABLE IF NOT EXISTS code_repositories (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users (id),
    name TEXT NOT NULL,
    description TEXT,
    remote_name TEXT NOT NULL,
    languages TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE code_repositories DROP CONSTRAINT IF EXISTS code_repositories_owner_id_idx;
ALTER TABLE code_repositories ADD CONSTRAINT code_repositories_owner_id_idx UNIQUE (owner_id, name);

CREATE OR REPLACE FUNCTION code_repositories_languages_transform() RETURNS TRIGGER AS $$
BEGIN
    NEW.languages = array_agg(LOWER(language)) FROM unnest(NEW.languages) AS language;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER code_repositories_languages_transform
BEFORE INSERT OR UPDATE ON code_repositories
FOR EACH ROW EXECUTE FUNCTION code_repositories_languages_transform();

CREATE INDEX IF NOT EXISTS repositories_owner_id_idx ON code_repositories (owner_id);

COMMIT;