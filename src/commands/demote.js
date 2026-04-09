const { Ranks, Loadouts } = require('../utils/military');

module.exports = {
    name: 'demote',
    description: 'Demote a soldier to the previous rank.',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Negative. You lack the necessary clearance to issue demotions.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Invalid syntax. Provide a target soldier. Usage: !demote @user');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('Target soldier not found in the server.');
        }

        const userData = client.db.getUser(targetUser.id);
        const currentRankIdx = Ranks.indexOf(userData.rank);

        let newRank;

        // Check if an explicit rank argument was passed (e.g. !demote @user Sepoy)
        if (args.length > 1) {
            const requestedRankParts = args.slice(1).filter(arg => !arg.startsWith('<@') && !arg.endsWith('>'));
            const requestedRank = requestedRankParts.join(' ');

            newRank = Ranks.find(r => r.toLowerCase() === requestedRank.toLowerCase());

            if (!newRank) {
                return message.reply(`Invalid rank specified. Usage: !demote @user [RankName]`);
            }

            const newRankIdx = Ranks.indexOf(newRank);
            if (newRankIdx >= currentRankIdx) {
                return message.reply(`Soldier is currently a ${userData.rank}. Demotion requires a lower rank.`);
            }
        } else {
            if (currentRankIdx <= 0) {
                return message.reply('Soldier is already at the lowest rank (Sepoy) or has an invalid rank.');
            }
            newRank = Ranks[currentRankIdx - 1];
        }

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
            userData.serviceRecord.push(`[${new Date().toISOString()}] Demoted to ${newRank} by ${message.author.username}`);
            await client.db.updateUser(client, targetUser.id, { rank: newRank });

            message.channel.send(`**[DISCIPLINARY ACTION]** Copy that. ${targetUser} has been demoted to **${newRank}**. Central database updated.`);
        } catch (error) {
            console.error('Demotion error:', error);
            message.reply('System Error: Negative. Unable to complete disciplinary protocol. Verify permissions.');
        }
    }
};
