# Rashtriya Rifles (31st) Discord Bot

A custom-built Discord bot designed for immersive, realistic military roleplay and simulation for the Rashtriya Rifles (31st) Roblox community. This bot focuses on military discipline, chain of command, and permanent data records.

## Features
- **Military Rank Structure:** 16 ranks from Sepoy up to General, following realistic hierarchies.
- **Loadout / Combat Roles:** Rifleman, Sniper, Medic, Radioman, Engineer, Machine Gunner.
- **Operations & Reports:** Ability to schedule operations and submit detailed After Action Reports (AARs).
- **Attendance & LOA:** Automated logging for operation attendance and Leaves of Absence (LOA).
- **Squad System:** Allows command to create sub-units (squads), assign squad leaders, and move personnel into them.
- **Permanent Service Records:** Every promotion, demotion, role reassignment, and operation attendance is logged into a permanent user file.
- **Channel Database:** No external SQL/NoSQL database required. The bot uses a designated Discord channel to save its `db.json` file as an attachment. It retrieves and uploads to this channel on startup and after data updates.

## Setup Instructions

### 1. Discord Developer Portal
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new Application and add a Bot.
3. Under the **Bot** tab, enable the following **Privileged Gateway Intents**:
   - `Server Members Intent`
   - `Message Content Intent`
4. Copy the **Bot Token**.

### 2. Environment Variables
Create a `.env` file in the root directory with the following configuration:

```env
DISCORD_TOKEN=your_bot_token_here
PREFIX=!
GUILD_ID=your_discord_server_id_here
DB_CHANNEL_ID=your_database_channel_id_here
CLIENT_ID=your_bot_client_id_here
```

*Note: Ensure the `DB_CHANNEL_ID` points to a private text channel where the bot has read, send, and attach files permissions. No regular members should have access to this channel.*

### 3. Discord Roles
The bot automatically syncs rank and loadout assignments with Discord roles. For this feature to work, you must create roles in your server matching exactly the names configured in `src/utils/military.js`.

**Ranks (Lowest to Highest):**
- Sepoy
- Lance Naik
- Naik
- Havildar
- Naib Subedar
- Subedar
- Subedar Major
- Lieutenant
- Captain
- Major
- Lieutenant Colonel
- Colonel
- Brigadier
- Major General
- Lieutenant General
- General

**Loadouts:**
- Rifleman
- Sniper
- Medic
- Radioman
- Engineer
- Machine Gunner

### 4. Running the Bot
Before running the bot for the first time, you must deploy the slash commands to your server:
```bash
npm install
node src/deploy-commands.js
```

Then start the bot:
```bash
node src/index.js
```

## Commands
* `!ping` - Check connection to central command.
* `!profile [@user]` - View military profile and stats.
* `!record [@user]` - View the recent permanent service history for a soldier.
* `!promote @user` - (Requires ManageRoles permission) Promotes to the next rank.
* `!demote @user` - (Requires ManageRoles permission) Demotes to the previous rank.
* `!assign_loadout @user <LoadoutName>` - (Requires ManageRoles permission) Assigns a combat role.
* `!op schedule <OpName>` - Schedule a new operation.
* `!op report <OpID> <AAR Content>` - Complete an operation and log AAR.
* `!attend <OpID>` - Log your attendance for a scheduled operation.
* `!leave <Reason/Duration>` - Request official Leave of Absence.
* `!return` - Return to Active duty from Leave.
* `!squad create <SquadName>` - Create a new squad.
* `!squad add <SquadName> @user` - Assign personnel to a squad.
* `!squad view [SquadName]` - View roster for a specific squad or list all active squads.
