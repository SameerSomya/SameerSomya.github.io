const { AttachmentBuilder } = require('discord.js');

class Database {
    constructor() {
        this.data = {
            users: {}, // stores profiles, ranks, etc.
            squads: {},
            operations: [],
            attendance: {},
            leave: {}
        };
        this.isLoaded = false;
        this.lastMessageId = null;
    }

    async load(client) {
        if (!client.databaseChannelId) {
            console.error('[MIL-NET] Error: DB_CHANNEL_ID is not configured in .env');
            return;
        }

        try {
            const channel = await client.channels.fetch(client.databaseChannelId);
            if (!channel) {
                console.error('[MIL-NET] Error: Database channel not found.');
                return;
            }

            const messages = await channel.messages.fetch({ limit: 10 });
            const latestMsg = messages.find(m => m.author.id === client.user.id && m.attachments.size > 0);

            if (latestMsg) {
                const attachment = latestMsg.attachments.first();
                if (attachment && attachment.name === 'db.json') {
                    const response = await fetch(attachment.url);
                    const fileData = await response.json();
                    this.data = fileData;
                    this.lastMessageId = latestMsg.id;
                    console.log('[MIL-NET] Database synchronized from central command.');
                }
            } else {
                console.log('[MIL-NET] No existing database found. Initializing new permanent record.');
                await this.save(client);
            }
            this.isLoaded = true;
        } catch (error) {
            console.error('[MIL-NET] Database load failure:', error);
        }
    }

    async save(client) {
        if (!client.databaseChannelId) return;

        try {
            const channel = await client.channels.fetch(client.databaseChannelId);
            if (!channel) return;

            const buffer = Buffer.from(JSON.stringify(this.data, null, 2), 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: 'db.json' });

            const newMsg = await channel.send({
                content: `[MIL-NET] System Backup: ${new Date().toISOString()}`,
                files: [attachment]
            });

            // Clean up old messages to prevent clutter
            if (this.lastMessageId) {
                try {
                    const oldMsg = await channel.messages.fetch(this.lastMessageId);
                    if (oldMsg) await oldMsg.delete();
                } catch (e) {
                    // Message might already be deleted
                }
            }

            this.lastMessageId = newMsg.id;
        } catch (error) {
            console.error('[MIL-NET] Failed to save database:', error);
        }
    }

    // Helper functions for user data
    getUser(userId) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                id: userId,
                rank: 'Sepoy',
                loadout: 'Rifleman',
                joinDate: new Date().toISOString(),
                operationsAttended: 0,
                leaveStatus: 'Active',
                squad: null,
                serviceRecord: []
            };
        }
        return this.data.users[userId];
    }

    async updateUser(client, userId, updates) {
        const user = this.getUser(userId);
        this.data.users[userId] = { ...user, ...updates };
        await this.save(client);
    }
}

module.exports = new Database();
