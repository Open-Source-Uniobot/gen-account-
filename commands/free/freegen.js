const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

// Map pour stocker les timestamps de dernière utilisation par utilisateur
let cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen-free')
        .setDescription('Générer un service')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('Choisissez un fichier')
                .setRequired(true)
                .addChoices(getFileChoices())),

    async execute(interaction) {
        const userId = interaction.user.id;
        const memberRoles = interaction.member.roles.cache;
        const allowedRoleId = config.free;
        const blacklistedRoleId = config.wl;
        const allowedChannelId = config.cFree;

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
        const cooldownAmount = 60 * 60 * 1000; // 1 heure en millisecondes

        // Vérifier le cooldown
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeftSeconds = (expirationTime - now) / 1000;
                const timeLeftHours = Math.ceil(timeLeftSeconds / 3600); // Convertir en heures et arrondir vers le haut

                console.log(`[GEN-FREE] Utilisateur ${userId} a essayé d'utiliser la commande trop tôt. Temps restant : ${timeLeftHours} heures`);
                return interaction.reply(`Veuillez patienter encore <t:${Math.floor(expirationTime / 1000)}:R> avant de réutiliser la commande \`/gen-free\`.`);
            }
        }

        // Récupérer le nom du fichier à partir des options de l'interaction
        const filename = interaction.options.getString('filename');
        const filePath = `./datafree/${filename}`;

        // Lire les services disponibles dans le fichier
        const services = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);

        // Vérifier s'il y a des services disponibles
        if (services.length === 0) {
            return interaction.reply('Aucun service disponible dans le fichier sélectionné.');
        }

        // Choisir aléatoirement un service parmi ceux disponibles
        const service = services[Math.floor(Math.random() * services.length)];

        // Mettre à jour le fichier en enlevant le service utilisé
        const updatedServices = services.filter(s => s !== service);
        fs.writeFileSync(filePath, updatedServices.join('\n'));

        // Mettre à jour le cooldown pour l'utilisateur
        cooldowns.set(userId, now);

        // Créer un Embed pour le service généré
        const embed = new EmbedBuilder()
            .setTitle('Service Généré')
            .setDescription(`Voici le service que vous avez généré :  \`\`${service}\`\``)
            .setColor('#0099ff');

        try {
            // Envoyer le service généré en message privé à l'utilisateur
            await interaction.user.send({ embeds: [embed] });
            await interaction.reply('Le service a été envoyé en message privé.');

            // Log de succès d'envoi du service
                const logChannel = interaction.guild.channels.cache.get(config.Logs);
                if (logChannel) {
                    logChannel.send(`[GEN-FREE] Service généré "${filename}" envoyé à l'utilisateur <@${userId}>`);
                } else {
                    console.error(`[GEN-FREE] Impossible de trouver le salon de logs avec l'ID ${config.logs.channelId}`);
                }
            

        } catch (erreur) {
            console.error(erreur);
            await interaction.reply('Échec de l\'envoi du service en message privé.');

            // Log d'échec d'envoi du service
        }
    }
};

// Fonction pour récupérer les choix de fichier disponibles
function getFileChoices() {
    const files = fs.readdirSync('./datafree').filter(file => file.endsWith('.txt'));
    return files.map(file => ({ name: file, value: file }));
}
