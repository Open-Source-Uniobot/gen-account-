const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

let cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen-nitro')
        .setDescription('Générer des liens Nitro'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const memberRoles = interaction.member.roles.cache;
        const allowedRoleId = config.vip; // Rôle autorisé pour l'utilisation de la commande
        const blacklistedRoleId = config.wl; // Rôle pour la liste noire
        const allowedChannelId = config.nitro; // Canal autorisé pour l'utilisation de la commande

        // Vérifier si l'utilisateur est sur la liste noire
        if (memberRoles.has(blacklistedRoleId)) {
            return interaction.reply('Vous êtes sur la liste noire et ne pouvez pas utiliser ce bot.');
        }

        // Vérifier si l'utilisateur a le rôle requis
        if (!memberRoles.has(allowedRoleId)) {
            return interaction.reply('Vous n\'avez pas le rôle requis pour utiliser ce bot.');
        }

        // Vérifier si la commande est exécutée dans le bon canal
        if (interaction.channelId !== allowedChannelId) {
            return interaction.reply('Cette commande ne peut être utilisée que dans le canal autorisé.');
        }

        const now = Date.now();
        const cooldownAmount = 60 * 60 * 1000; // Cooldown d'une heure en millisecondes

        // Vérifier le cooldown
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeftSeconds = (expirationTime - now) / 1000;
                const timeLeftMinutes = Math.ceil(timeLeftSeconds / 60); // Convertir en minutes et arrondir vers le haut

                return interaction.reply(`Veuillez patienter encore ${timeLeftMinutes} minutes avant de réutiliser la commande \`/gen-nitro\`.`);
            }
        }

        // Obtenir le nombre de liens Nitro à générer
        const quantity = 20;

        // Générer et envoyer les liens Nitro
        try {
            await interaction.reply(`Les ${quantity} liens Nitro ont été envoyés en message privé.`);

            for (let i = 0; i < quantity; i++) {
                const nitroLink = generateNitroLink(); // Générer un lien Nitro aléatoire
                await interaction.user.send(`Voici votre lien Nitro ${i + 1} : ${nitroLink}`);
            }

            // Enregistrer le cooldown
            cooldowns.set(userId, now);

        } catch (erreur) {
            console.error(erreur);
            await interaction.reply('Échec de l\'envoi des liens Nitro en message privé.');

            // Logs d'erreur
            console.error(`[GEN-NITRO] Échec de l'envoi des liens Nitro à l'utilisateur ${userId}:`, erreur);
        }
    }
};

// Fonction pour générer un lien Nitro aléatoire (à adapter selon vos besoins)
function generateNitroLink() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let link = 'https://discord.gift/';

    // Générer une chaîne aléatoire de 16 caractères
    for (let i = 0; i < 16; i++) {
        link += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return link;
}

function getFileChoices() {
    const files = fs.readdirSync('./datafree').filter(file => file.endsWith('.txt'));
    return files.map(file => ({ name: file, value: file }));
}
