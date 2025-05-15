const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles'),

    async execute(interaction) {
        const commands = interaction.client.commands;

        // Construire la description de l'embed
        let description = 'Liste des commandes disponibles :\n';

        commands.forEach(command => {
            description += `**/${command.data.name}** - ${command.data.description}\n`;
        });

        // Construire l'embed avec la description mise à jour
        const embed = new EmbedBuilder()
            .setTitle('Aide - Liste des commandes')
            .setDescription(description)
            .setColor('#0099ff');

        try {
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la commande help :', error);
            await interaction.reply('Une erreur est survenue lors de l\'envoi de la commande help.');
        }
    },
};
