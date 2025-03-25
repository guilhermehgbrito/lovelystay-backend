INSERT INTO code_repositories ("owner_id", "name", "description", "remote_name", "languages") 
VALUES (${ownerId}, ${name}, ${description}, ${remoteName}, ${languages}) 
ON CONFLICT ("owner_id", "name") DO UPDATE 
SET "description" = ${description}, "remote_name" = ${remoteName}, "languages" = ${languages}, "updated_at" = CURRENT_TIMESTAMP
RETURNING "id", "owner_id", "name", "description", "remote_name", "languages", "created_at", "updated_at";