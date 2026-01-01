const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove o castigo (timeout) de um membro.')
        .addUserOption(option => 
            option.setName('alvo')
                .setDescription('Membro que terá o silêncio removido')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Motivo da remoção do castigo'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Corrigido aqui

    async execute(interaction) {
        const user = interaction.options.getUser('alvo');
        const member = interaction.options.getMember('alvo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const logChannelId = '1455678835990466745';

        // --- VERIFICAÇÕES DE SEGURANÇA ---

        if (!member) {
            return interaction.reply({ content: '❌ Este usuário não está no servidor.', ephemeral: true });
        }

        // Verifica se o usuário está realmente em timeout
        if (!member.communicationDisabledUntilTimestamp || member.communicationDisabledUntilTimestamp < Date.now()) {
            return interaction.reply({ content: `❌ **${user.tag}** não está silenciado no momento.`, ephemeral: true });
        }

        // Verifica hierarquia de cargos
        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ 
                content: `❌ Eu não posso remover o silêncio de **${user.tag}** porque o cargo dele é superior ou igual ao meu.`, 
                ephemeral: true 
            });
        }

        // --- BOTÕES DE CONFIRMAÇÃO ---

        const confirm = new ButtonBuilder()
            .setCustomId('confirm_unmute')
            .setLabel('Confirmar Unmute')
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel_unmute')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        const response = await interaction.reply({
            content: `🔊 Deseja remover o castigo de **${user.tag}**?\n**Motivo:** \`${reason}\``,
            components: [row],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm_unmute') {
                try {
                    // Remover timeout
                    await member.timeout(null, reason);

                    // Envio de Log
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor('#42f5e3')
                            .setTitle('🔊 Castigo Removido (Unmute)')
                            .setThumbnail(user.displayAvatarURL())
                            .addFields(
                                { name: '👤 Usuário:', value: `${user.tag} (${user.id})`, inline: true },
                                { name: '🛡️ Moderador:', value: `${interaction.user.tag}`, inline: true },
                                { name: '📄 Motivo:', value: reason }
                            )
                            .setTimestamp();
                        
                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    await i.update({ content: `✅ O silêncio de **${user.tag}** foi removido.`, components: [] });

                } catch (error) {
                    if (error.code === 50013) {
                        await i.update({ content: '❌ Erro de permissão: Meu cargo precisa estar acima do alvo.', components: [] });
                    } else {
                        console.error(error);
                        await i.update({ content: '❌ Erro ao processar o unmute.', components: [] });
                    }
                }
            } else {
                await i.update({ content: '❌ Ação cancelada.', components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) interaction.editReply({ content: '⏰ Tempo esgotado.', components: [] });
        });
    },
};