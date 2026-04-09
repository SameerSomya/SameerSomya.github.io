const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DB_FILE_PATH = path.join(__dirname, '../../db.json');

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
        // First try to load from local file for immediate persistence
        if (fs.existsSync(DB_FILE_PATH)) {
            try {
                const rawData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
                this.data = JSON.parse(rawData);
                console.log('[MIL-NET] Database synchronized from local disk.');
                this.isLoaded = true;
            } catch (err) {
                console.error('[MIL-NET] Failed to read local db.json:', err);
            }
        }

        // Only try fetching from channel if local file isn't present or we want to sync message ID
        if (!client.databaseChannelId) {
            if (!this.isLoaded) console.error('[MIL-NET] Warning: DB_CHANNEL_ID is not configured in .env and no local db.json exists.');
            return;
        }

        try {
            const channel = await client.channels.fetch(client.databaseChannelId);
            if (!channel) {
                console.error('[MIL-NET] Warning: Database channel not found.');
                return;
            }

            const messages = await channel.messages.fetch({ limit: 10 });
            const latestMsg = messages.find(m => m.author.id === client.user.id && m.attachments.size > 0);

            if (latestMsg) {
                this.lastMessageId = latestMsg.id;

                // If local load failed/was absent, pull from Discord attachment
                if (!this.isLoaded) {
                    const attachment = latestMsg.attachments.first();
                    if (attachment && attachment.name === 'db.json') {
                        const response = await fetch(attachment.url);
                        const fileData = await response.json();
                        this.data = fileData;

                        // Save to local disk immediately
                        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2));
                        console.log('[MIL-NET] Database synchronized from central command (Discord). Saved locally.');
                    }
                }
            } else if (!this.isLoaded) {
                console.log('[MIL-NET] No existing database found. Initializing new permanent record.');
                await this.save(client);
            }
            this.isLoaded = true;
        } catch (error) {
            console.error('[MIL-NET] Database load failure:', error);
        }
    }

    async save(client) {
        // Always save to local file immediately
        try {
            fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2));
        } catch (err) {
            console.error('[MIL-NET] Failed to save local db.json:', err);
        }

        // Backup to Discord channel
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
            console.error('[MIL-NET] Failed to backup database to Discord:', error);
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
