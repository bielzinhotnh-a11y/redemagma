const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Verifica o status do servidor de Minecraft'),
    async execute(interaction) {
        await interaction.deferReply(); // Dá tempo para a API responder
        
        try {
            const response = await axios.get(`https://mcapi.us/server/status?ip=sd-br1.blazebr.com`);
            const data = response.data;

            if (!data.online) {
                return interaction.editReply('❌ O servidor está **Offline** no momento.');
            }

            const embed = new EmbedBuilder()
                .setTitle('⛏️ Status do Servidor')
                .setColor('#00FF00')
                .addFields(
                    { name: '🌐 IP', value: `\`sd-br1.blazebr.com:25577\`` },
                    { name: '👥 Jogadores', value: `${data.players.now}/${data.players.max}`, inline: true },
                    { name: '🟢 Status', value: 'Online', inline: true }
                )
                .setFooter({ text: 'Atualizado via API mcapi.us' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply('❌ Erro ao consultar o servidor.');
        }
    },
};