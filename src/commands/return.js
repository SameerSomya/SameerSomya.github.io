module.exports = {
    name: 'return',
    description: 'Return from Leave of Absence (LOA).',
    execute: async (message, args, client) => {
        const userId = message.author.id;
        const userData = client.db.getUser(userId);

        if (userData.leaveStatus === 'Active') {
            return message.reply('You are already marked as Active.');
        }

        userData.leaveStatus = 'Active';
        userData.serviceRecord.push(`[${new Date().toISOString()}] Returned to Active Duty.`);

        await client.db.updateUser(client, userId, userData);

        message.reply(`Welcome back to Active Duty. Status updated. Report to your commanding officer.`);
    }
};
