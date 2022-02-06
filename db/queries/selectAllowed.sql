SELECT * FROM AllowedUsers WHERE Id = $id AND GuildId = $guildId;
SELECT Id FROM AllowedRoles WHERE GuildId = $guildId;