module.exports = {
    name: 'leave',
    description: 'Request or log official Leave of Absence (LOA).',
    execute: async (message, args, client) => {
        if (args.length === 0) {
            return message.reply('Specify the duration or reason for leave. Usage: !leave <reason/duration>');
        }

        const reason = args.join(' ');
        const userId = message.author.id;
        const userData = client.db.getUser(userId);

        userData.leaveStatus = `On Leave: ${reason}`;
        userData.serviceRecord.push(`[${new Date().toISOString()}] Granted Leave of Absence: ${reason}`);

        await client.db.updateUser(client, userId, userData);

        message.reply(`Leave of Absence registered. Status updated. Return safely, soldier.`);
    }
};
