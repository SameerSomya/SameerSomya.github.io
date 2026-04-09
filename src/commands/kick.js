module.exports = {
    name: 'kick',
    description: 'Kick a soldier from the server.',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('KickMembers')) {
            return message.reply('Negative. You lack the clearance to kick personnel.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Specify a target. Usage: !kick @user [reason]');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('Target not found in server.');
        }

        const reason = args.slice(1).filter(arg => !arg.startsWith('<@')).join(' ') || 'Disciplinary Action - No reason specified.';

        try {
            await targetMember.kick(reason);
            message.channel.send(`**[DISCHARGE]** ${targetUser.username} has been discharged (Kicked). Reason: ${reason}`);
        } catch (error) {
            console.error('Kick error:', error);
            message.reply('System Error: Unable to complete discharge protocol. Ensure my role is higher than the target.');
        }
    }
};
