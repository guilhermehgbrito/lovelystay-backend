SELECT "id", "github_id", "github_username", "name", "email", "location", "bio", "created_at", "updated_at"
FROM users
ORDER BY "created_at" DESC
LIMIT ${limit}
OFFSET ${offset};