DELETE FROM AllowedUsers WHERE GuildId = $id;
DELETE FROM AllowedRoles WHERE GuildId = $id;
DELETE FROM Roles WHERE GuildId = $id;
DELETE FROM Guilds WHERE Id = $id;