module.exports = {
    name: 'timeout',
    description: 'Temporarily mute (timeout) a soldier.',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('Negative. You lack the clearance to timeout personnel.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Specify a target. Usage: !timeout @user <minutes> [reason]');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) return message.reply('Target not found in server.');

        const argsWithoutMention = args.filter(arg => !arg.startsWith('<@') && !arg.endsWith('>'));

        const minutes = parseInt(argsWithoutMention[0]);
        if (isNaN(minutes) || minutes <= 0) {
            return message.reply('Provide a valid duration in minutes. Usage: !timeout @user <minutes> [reason]');
        }

        const reason = argsWithoutMention.slice(1).join(' ') || 'Disciplinary Action';
        const msDuration = minutes * 60 * 1000;

        try {
            await targetMember.timeout(msDuration, reason);
            message.channel.send(`**[BRIG]** ${targetUser.username} has been placed in the brig (Timeout) for ${minutes} minutes. Reason: ${reason}`);
        } catch (error) {
            console.error('Timeout error:', error);
            message.reply('System Error: Unable to complete timeout protocol. Ensure my role is higher than the target.');
        }
    }
};
