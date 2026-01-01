const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configura o canal de logs do servidor')
        .addChannelOption(option => 
            option.setName('canal')
                .setDescription('O canal onde os logs serão enviados')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');
        // Aqui você salvaria o canal.id no seu banco de dados
        await interaction.reply({ content: `✅ Canal de logs definido para ${canal}`, ephemeral: true });
    },
};