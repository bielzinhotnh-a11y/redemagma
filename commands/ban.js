const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um usuário do servidor.')
        .addUserOption(option => option.setName('alvo').setDescription('Usuário a ser banido').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo do banimento'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('alvo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const logChannelId = '1455678835990466745';

        // Criação dos botões
        const confirm = new ButtonBuilder()
            .setCustomId('confirm_ban')
            .setLabel('Confirmar Banimento')
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel_ban')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        const response = await interaction.reply({
            content: `⚠️ Você tem certeza que deseja banir **${user.tag}** pelo motivo: \`${reason}\`?`,
            components: [row],
            ephemeral: true
        });

        // Coletor para ler o clique no botão
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 // 30 segundos para confirmar
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm_ban') {
                try {
                    await interaction.guild.members.ban(user, { reason });

                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    const logEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🔨 Usuário Banido')
                        .addFields(
                            { name: '👤 Usuário:', value: `${user.tag} (${user.id})`, inline: true },
                            { name: '🛡️ Moderador:', value: `${interaction.user.tag}`, inline: true },
                            { name: '📄 Motivo:', value: reason }
                        )
                        .setTimestamp();

                    if (logChannel) logChannel.send({ embeds: [logEmbed] });

                    await i.update({ content: `✅ **${user.tag}** foi banido com sucesso.`, components: [] });
                } catch (error) {
                    await i.update({ content: '❌ Erro ao banir: O usuário pode ter um cargo maior ou o bot não tem permissão.', components: [] });
                }
            } else if (i.customId === 'cancel_ban') {
                await i.update({ content: '❌ Banimento cancelado.', components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: '⏰ Tempo esgotado. O banimento não foi executado.', components: [] });
            }
        });
    },
};