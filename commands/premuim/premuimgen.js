const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

// Map pour stocker les timestamps de dernière utilisation par utilisateur
let cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen-premium')
        .setDescription('Générer un service')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('Choisissez un fichier')
                .setRequired(true)
                .addChoices(getFileChoices())),

    async execute(interaction) {
        const userId = interaction.user.id;
        const memberRoles = interaction.member.roles.cache;
        const allowedRoleId = config.vip;
        const blacklistedRoleId = config.wl;
        const allowedChannelId = config.cVip;

        // Vérifier si l'utilisateur a le rôle autorisé
        if (memberRoles.has(blacklistedRoleId)) {
            return interaction.reply('Vous êtes sur la liste noire et ne pouvez pas utiliser ce bot.');
        }

        if (!memberRoles.has(allowedRoleId)) {
            return interaction.reply('Vous n\'avez pas le rôle requis pour utiliser ce bot.');
        }

        // Vérifier si la commande est exécutée dans le bon canal
        if (interaction.channelId !== allowedChannelId) {
            return interaction.reply('Cette commande ne peut être utilisée que dans le canal autorisé.');
        }

        const now = Date.now();
        const cooldownAmount = 5 * 60 * 1000; // 5 minutes en millisecondes

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeftSeconds = (expirationTime - now) / 1000;
                const timeLeftMinutes = Math.ceil(timeLeftSeconds / 60); // Convertir en minutes et arrondir vers le haut

                return interaction.reply(`Veuillez patienter encore <t:${Math.floor(expirationTime / 1000)}:R> avant de réutiliser la commande \`/gen-premium\`.`);
            }
        }

        const filename = interaction.options.getString('filename');
        const filePath = `./datavip/${filename}`;
        const services = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);

        if (services.length === 0) {
            return interaction.reply('Aucun service disponible dans le fichier sélectionné.');
        }

        const service = services[Math.floor(Math.random() * services.length)];

        // Supprimer le service utilisé
        const updatedServices = services.filter(s => s !== service);
        fs.writeFileSync(filePath, updatedServices.join('\n'));

        // Mettre à jour le cooldown
        cooldowns.set(userId, now);

        // Créer et envoyer un Embed avec le service
        const embed = new EmbedBuilder()
            .setTitle('Service Généré')
            .setDescription(`Voici le service que vous avez généré :  \`\`${service}\`\``)
            .setColor('#0099ff');

        try {
            await interaction.user.send({ embeds: [embed] });
            await interaction.reply('Le service a été envoyé en message privé.');

            const logChannel = interaction.guild.channels.cache.get(config.Logs);
                if (logChannel) {
                    logChannel.send(`[GEN-PREMUIM] Service généré "${filename}" envoyé à l'utilisateur <@${userId}>`);
                } else {
                    console.error(`[GEN-PREMUIM] Impossible de trouver le salon de logs avec l'ID ${config.logs.channelId}`);
                }
        } catch (erreur) {
            console.error(erreur);
            await interaction.reply('Échec de l\'envoi du service en message privé.');
        }
    }
};

function getFileChoices() {
    const files = fs.readdirSync('./datavip').filter(file => file.endsWith('.txt'));
    return files.map(file => ({ name: file, value: file }));
}
