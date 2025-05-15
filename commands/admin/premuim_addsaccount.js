const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { Permissions, TextInputBuilder, TextInputStyle, Events, ModalBuilder, ActionRowBuilder } = require('discord.js');
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ajout-account-premuim')
        .setDescription('Ajouter un compte à un fichier .txt')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('Choisir un fichier .txt')
                .setRequired(true)
                .addChoices(getFileChoices())),

    async execute(interaction) {
        const allowedRoleId = config.admin; // Remplacez par l'ID du rôle autorisé
        const memberRoles = interaction.member.roles.cache;

        // Vérifier si l'utilisateur a le rôle autorisé
        if (!memberRoles.has(allowedRoleId)) {
            return interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande.');
        }

        const filename = interaction.options.getString('filename');

        const modal = new ModalBuilder()
            .setCustomId('myModal')
            .setTitle('Ajoute tes comptes');

        const ccColorInput = new TextInputBuilder()
            .setCustomId('ffColorInput')
            .setLabel("Email:Password")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)
            .setMinLength(5)
            .setPlaceholder('teste@gmail.com:12345678')
            .setRequired(true);

        // Create action rows and add them to the modal
        const firstActionRow = new ActionRowBuilder().addComponents(ccColorInput);


        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);

        const filter = (i) => i.customId === 'myModal' && i.user.id === interaction.user.id;
        try {
            const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 });

            const account = modalInteraction.fields.getTextInputValue('ffColorInput');

            // Vérifier si le fichier sélectionné existe
            const filePath = `./datavip/${filename}`;
            if (!fs.existsSync(filePath)) {
                return modalInteraction.reply('Le fichier sélectionné n\'existe pas.');
            }

            // Vérifier si le compte est au bon format
            if (!validateAccountFormat(account)) {
                return modalInteraction.reply('Le compte doit être au format email:password.');
            }

            // Ajouter le compte au fichier .txt
            try {
                fs.appendFileSync(filePath, `${account}\n`);
                return modalInteraction.reply(`Le compte \`${account}\` a été ajouté au fichier \`${filename}\`.`);
            } catch (erreur) {
                console.error(erreur);
                return modalInteraction.reply('Une erreur est survenue lors de l\'ajout du compte.');
            }
        } catch (err) {
            console.error(err);
            return interaction.followUp('Vous avez pris trop de temps pour répondre.');
        }
    }
};

function getFileChoices() {
    const files = fs.readdirSync('./datavip').filter(file => file.endsWith('.txt'));
    return files.map(file => ({ name: file, value: file }));
}

function validateAccountFormat(account) {
    const regex = /.+@.+\..+:.+/;
    return regex.test(account);
}
