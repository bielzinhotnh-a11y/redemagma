client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const logChannel = oldMember.guild.channels.cache.get('1454607959454908498');
    if (!logChannel) return;

    // Verifica se o que mudou foi o apelido (nickname)
    if (oldMember.nickname !== newMember.nickname) {
        const embed = new EmbedBuilder()
            .setColor('#3498db') // Azul
            .setAuthor({ name: `${newMember.user.tag}`, iconURL: newMember.user.displayAvatarURL() })
            .setDescription(`👤 ${newMember.user} **alterou o apelido**`)
            .addFields(
                { name: 'Antigo apelido:', value: `\`${oldMember.nickname || 'Nenhum'}\``, inline: true },
                { name: 'Novo apelido:', value: `\`${newMember.nickname || 'Nenhum'}\``, inline: true }
            )
            .setFooter({ text: `ID do usuário: ${newMember.id}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
});