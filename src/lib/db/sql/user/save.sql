INSERT INTO users ("github_id", "github_username", "name", "email", "location", "bio") 
VALUES (${githubId}, ${githubUsername}, ${name}, ${email}, ${location}, ${bio}) 
ON CONFLICT ("github_id") DO UPDATE 
SET "name" = ${name}, "email" = ${email}, "location" = ${location}, "bio" = ${bio}, "updated_at" = CURRENT_TIMESTAMP
RETURNING "id", "github_id", "github_username", "name", "email", "location", "bio", "created_at", "updated_at";