const { Ranks, Loadouts } = require('../utils/military');

module.exports = {
    name: 'promote',
    description: 'Promote a soldier to the next rank.',
    execute: async (message, args, client) => {
        // Simple permission check - normally you'd check for high command roles
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Negative. You lack the necessary clearance to issue promotions.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Invalid syntax. Provide a target soldier. Usage: !promote @user');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('Target soldier not found in the server.');
        }

        const userData = client.db.getUser(targetUser.id);
        const currentRankIdx = Ranks.indexOf(userData.rank);

        let newRank;

        // Check if an explicit rank argument was passed (e.g. !promote @user Captain)
        if (args.length > 1) {
            const requestedRankParts = args.slice(1).filter(arg => !arg.startsWith('<@') && !arg.endsWith('>'));
            const requestedRank = requestedRankParts.join(' ');

            newRank = Ranks.find(r => r.toLowerCase() === requestedRank.toLowerCase());

            if (!newRank) {
                return message.reply(`Invalid rank specified. Usage: !promote @user [RankName]`);
            }

            const newRankIdx = Ranks.indexOf(newRank);
            if (newRankIdx <= currentRankIdx) {
                return message.reply(`Soldier is already a ${userData.rank}. Promotion requires a higher rank.`);
            }
        } else {
            if (currentRankIdx === -1 || currentRankIdx === Ranks.length - 1) {
                return message.reply('Soldier is already at the maximum rank or has an invalid rank.');
            }
            newRank = Ranks[currentRankIdx + 1];
        }

        // Discord Role Sync Logic
        try {
            // Find old role and remove
            const oldRole = message.guild.roles.cache.find(r => r.name === userData.rank);
            if (oldRole && targetMember.roles.cache.has(oldRole.id)) {
                await targetMember.roles.remove(oldRole);
            }

            // Find new role and add
            const newRole = message.guild.roles.cache.find(r => r.name === newRank);
            if (newRole) {
                await targetMember.roles.add(newRole);
            } else {
                message.channel.send(`[WARNING] Discord role for "${newRank}" not found. Please create it to sync.`);
            }

            // Update database
            userData.serviceRecord.push(`[${new Date().toISOString()}] Promoted to ${newRank} by ${message.author.username}`);
            await client.db.updateUser(client, targetUser.id, { rank: newRank });

            message.channel.send(`**[PROMOTION]** Affirmative. ${targetUser} has been promoted to **${newRank}**. Acknowledged and recorded in central database.`);
        } catch (error) {
            console.error('Promotion error:', error);
            message.reply('System Error: Negative. Unable to complete promotion protocol. Verify permissions.');
        }
    }
};
