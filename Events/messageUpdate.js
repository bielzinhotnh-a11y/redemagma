client.on('messageUpdate', async (oldMessage, newMessage) => {
    // Ignora bots e mensagens sem alteração de conteúdo
    if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

    const logChannel = oldMessage.guild.channels.cache.get('1454607959454908498');
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setColor('#ffff00') // Amarelo
        .setAuthor({ name: `${oldMessage.author.tag}`, iconURL: oldMessage.author.displayAvatarURL() })
        .setDescription(`📝 ${oldMessage.author} **editou uma mensagem de texto**`)
        .addFields(
            { name: 'Canal de texto:', value: `${oldMessage.channel}` },
            { name: 'Antiga mensagem:', value: `\`\`\`${oldMessage.content || 'Sem conteúdo'}\`\`\`` },
            { name: 'Nova mensagem:', value: `\`\`\`${newMessage.content || 'Sem conteúdo'}\`\`\`` }
        )
        .setFooter({ text: `ID do usuário: ${oldMessage.author.id}` })
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});