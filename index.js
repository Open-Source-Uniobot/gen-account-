const fs = require('fs');
const { Client, Intents, Collection, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, guildId } = require('./config.json');
const path = require('path');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

// Chargement des commandes
const commandFolders = fs.readdirSync('./commands').filter(f => fs.statSync(path.join('./commands', f)).isDirectory());
commandFolders.forEach(folder => {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        console.log(`\x1b[38;2;66;255;0mLa commande \x1b\x1b[96m${file.split('.')[0]}\x1b[0m\x1b[38;2;66;255;0m est chargée depuis \x1b\x1b[96m${folder}\x1b[0m`);
        client.commands.set(command.data.name, command);
    }
});

// Chargement de la liste noire
let blacklistedUsers = new Set();
const blacklistFilePath = './blacklist.json';
function loadBlacklist() {
    if (fs.existsSync(blacklistFilePath)) {
        try {
            const blacklistData = fs.readFileSync(blacklistFilePath, 'utf-8');
            const parsedData = JSON.parse(blacklistData);
            
            // Vérifiez si le fichier JSON a une propriété blacklistedUsers
            if (parsedData && parsedData.blacklistedUsers) {
                blacklistedUsers = new Set(parsedData.blacklistedUsers.map(user => user.id));
                console.log('\x1b[34mListe noire chargée depuis le fichier.\x1b[0m');
            } else {
                console.log('Le fichier de blacklist ne contient pas de données valides.');
            }
        } catch (error) {
            console.error('Erreur lors de la lecture du fichier de blacklist :', error);
        }
    } else {
        console.log('Aucun fichier de blacklist trouvé, une nouvelle liste noire sera créée.');
    }
}



// Fonction pour vérifier si un utilisateur est blacklisté
function isBlacklisted(userId) {
    return blacklistedUsers.has(userId);
}

// Écouteur d'événement ready
client.once('ready', async () => {

    // Chargement de la liste noire au démarrage
    loadBlacklist();

    // Mise à jour des commandes slash
    const rest = new REST({ version: '9' }).setToken(token);

    const commands = client.commands.map(command => command.data.toJSON());

    try {
        console.log('\x1b[38;2;213;255;0m[Commence la mise à jour slash] Début de la mise à jour des commandes d\'application (/).\x1b[0m');

        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guildId),
            { body: commands }
        );

        console.log('\x1b[32m[Good Mises à jour] Commandes d\'application (/) mises à jour avec succès.\x1b[0m');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des commandes slash :', error);
    }
    console.log('\x1b[32m[Bot] Connecté en tant que', client.user.tag, '\x1b[0m');

});

// Écouteur d'événement interactionCreate
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Vérification si l'utilisateur est blacklisté
    if (isBlacklisted(interaction.user.id)) {
        await interaction.reply({ content: 'Vous êtes sur la liste noire et ne pouvez pas utiliser les commandes.', ephemeral: true });
        return;
    }

    // Exécution de la commande si elle existe dans la collection
    if (!client.commands.has(commandName)) return;

    try {
        console.log('\x1b[96m[CMD-SLASH] ' + interaction.guild.name + ' | #' + interaction.channel.name + ' | ' + interaction.user.tag + ' | /' + commandName + '\x1b[0m');
        await client.commands.get(commandName).execute(interaction);
    } catch (error) {
        console.error('Erreur lors de l\'exécution de la commande :', error);
        await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'exécution de cette commande!', ephemeral: true });
    }
});

// Gestion des exceptions non capturées et des rejets de promesses non gérés
process.on('uncaughtException', (error) => {
    console.error('An uncaught exception occurred:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('An unhandled promise rejection occurred:', error);
});

// Connexion du bot
client.login(token);
