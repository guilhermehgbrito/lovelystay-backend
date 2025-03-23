BEGIN;

CREATE OR REPLACE FUNCTION get_user_languages(user_id integer) RETURNS text[] AS $$
DECLARE
    languages text[];
BEGIN
    WITH all_languages AS (
        SELECT unnest("code_repositories"."languages") AS "language"
        FROM "code_repositories"
        WHERE "code_repositories"."owner_id" = user_id
    )
    SELECT array_agg(DISTINCT "language") INTO languages
    FROM all_languages;

    RETURN languages;
END;
$$ LANGUAGE plpgsql;

COMMIT;