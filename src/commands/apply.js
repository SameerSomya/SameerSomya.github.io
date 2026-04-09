module.exports = {
    name: 'apply',
    description: 'Get the application link to join the Rashtriya Rifles (31st).',
    execute: async (message, args, client) => {
        const link = process.env.APPLY_LINK || 'https://roblox.com/ (Awaiting Command Configuration)';

        message.reply(`**[RECRUITMENT]** Interested in enlisting with the Rashtriya Rifles (31st)? \nSubmit your application here: ${link}`);
    }
};
