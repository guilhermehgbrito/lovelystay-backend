INSERT INTO code_repositories ("owner_id", "name", "description", "remote", "languages") 
VALUES (${ownerId}, ${name}, ${description}, ${remote}, ${languages}:array) 
ON CONFLICT ("owner_id", "name") DO UPDATE 
SET "description" = ${description}, "remote" = ${remote}, "languages" = ${languages}:array, "updated_at" = CURRENT_TIMESTAMP
RETURNING "id", "owner_id", "name", "description", "remote", "languages", "created_at", "updated_at";