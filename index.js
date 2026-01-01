const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    REST, 
    Routes, 
    Partials, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ButtonBuilder, 
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    PermissionFlagsBits,
    ChannelType,
    MessageFlags 
} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const transcript = require('discord-html-transcripts');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.User, Partials.GuildMember]
});

// --- CONFIGURAÇÕES DE IDs ---
const MINECRAFT_IP = 'sd-br1.blazebr.com:25577';
const ID_CANAL_IP = '1454538836037210183';
const ID_CANAL_JOGADORES = '1454590122262528151';
const ID_CANAL_STATUS = '1454590201363169351';
const ID_CANAL_LOG_FORMULARIO = '1455778138465239091';
const ID_LOGS_GERAL = '1454607959454908498';

// CONFIGURAÇÕES DE TICKET
const ID_LOG_TICKETS = '1455780252692517097'; 
const ID_CATEGORIA_TICKETS = '1455784280767598784';
const ID_CARGO_STAFF_TICKET = '1455784384828276837';

const ARQUIVO_CANDIDATOS = path.join(__dirname, 'candidatos.json');

if (!fs.existsSync(ARQUIVO_CANDIDATOS)) {
    fs.writeFileSync(ARQUIVO_CANDIDATOS, JSON.stringify([]));
}

// --- SISTEMA DE COMANDOS ---
client.commands = new Collection();
const commandsJSON = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commandsJSON.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsJSON });
        console.log('✅ Comandos globais registrados!');
    } catch (e) { console.error('❌ Erro REST:', e); }
})();

// --- STATUS MINECRAFT ---
async function updateMinecraftStatus() {
    try {
        const response = await axios.get(`https://mcapi.us/server/status?ip=${MINECRAFT_IP}`);
        const data = response.data;
        const channelIP = await client.channels.fetch(ID_CANAL_IP).catch(() => null);
        const channelPlayers = await client.channels.fetch(ID_CANAL_JOGADORES).catch(() => null);
        const channelStatus = await client.channels.fetch(ID_CANAL_STATUS).catch(() => null);

        if (data.online) {
            if (channelIP) await channelIP.setName(`🌐 • IP: ${MINECRAFT_IP}`);
            if (channelPlayers) await channelPlayers.setName(`👥 • Jogadores: ${data.players.now}/${data.players.max}`);
            if (channelStatus) await channelStatus.setName(`🟢 • Status: Online`);
        }
    } catch (e) { }
}

// --- INTERAÇÕES PRINCIPAIS ---
client.on('interactionCreate', async interaction => {
    
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction); } catch (e) { console.error(e); }
    }

    // FORMULÁRIO STAFF
    if (interaction.isButton() && interaction.customId === 'abrir_formulario') {
        const candidatos = JSON.parse(fs.readFileSync(ARQUIVO_CANDIDATOS));
        if (candidatos.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ Você já enviou uma candidatura.', flags: [MessageFlags.Ephemeral] });
        }

        const modal = new ModalBuilder().setCustomId('staff_modal').setTitle('Inscrição: Rede Magma');
        const fields = [
            { id: 'f_nome', label: 'Nome Completo:', style: TextInputStyle.Short },
            { id: 'f_idade', label: 'Idade:', style: TextInputStyle.Short },
            { id: 'f_tempo', label: 'Horários:', style: TextInputStyle.Short },
            { id: 'f_conhecimento', label: 'Conhecimento Técnico:', style: TextInputStyle.Paragraph },
            { id: 'f_motivo', label: 'Por que a Magma?', style: TextInputStyle.Paragraph }
        ];

        modal.addComponents(fields.map(f => new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(true)
        )));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'staff_modal') {
        const respostas = {
            nome: interaction.fields.getTextInputValue('f_nome'),
            idade: interaction.fields.getTextInputValue('f_idade'),
            tempo: interaction.fields.getTextInputValue('f_tempo'),
            cmd: interaction.fields.getTextInputValue('f_conhecimento'),
            motivo: interaction.fields.getTextInputValue('f_motivo'),
        };

        const protocolo = Math.floor(Math.random() * 90000) + 10000;
        const logChannel = interaction.guild.channels.cache.get(ID_CANAL_LOG_FORMULARIO);

        const embedLog = new EmbedBuilder()
            .setAuthor({ name: `Ficha #${protocolo}`, iconURL: interaction.user.displayAvatarURL() })
            .setColor('#7289da')
            .addFields(
                { name: '👤 Candidato', value: `${interaction.user}`, inline: true },
                { name: '📝 Nome/Idade', value: `\`${respostas.nome}\` / \`${respostas.idade}\``, inline: true },
                { name: '🛠️ Comandos', value: `\`\`\`${respostas.cmd}\`\`\`` },
                { name: '💡 Motivação', value: `\`\`\`${respostas.motivo}\`\`\`` }
            ).setTimestamp();

        if (logChannel) {
            await logChannel.send({ embeds: [embedLog] });
            const candidatos = JSON.parse(fs.readFileSync(ARQUIVO_CANDIDATOS));
            candidatos.push(interaction.user.id);
            fs.writeFileSync(ARQUIVO_CANDIDATOS, JSON.stringify(candidatos, null, 2));
        }
        await interaction.reply({ content: `✅ Ficha enviada com sucesso! Protocolo: \`#${protocolo}\`.`, flags: [MessageFlags.Ephemeral] });
    }

    // ABERTURA DE TICKET (CATEGORIA SETADA)
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        const categoria = interaction.values[0];
        const nomeCanal = `${categoria}-${interaction.user.username}`.toLowerCase();

        const canalExistente = interaction.guild.channels.cache.find(c => c.name === nomeCanal);
        if (canalExistente) return interaction.reply({ content: `❌ Já existe um ticket ativo: ${canalExistente}`, flags: [MessageFlags.Ephemeral] });

        await interaction.deferReply({ ephemeral: true });

        const canal = await interaction.guild.channels.create({
            name: nomeCanal,
            type: ChannelType.GuildText,
            parent: ID_CATEGORIA_TICKETS, // CATEGORIA SETADA
            topic: interaction.user.id,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                { id: ID_CARGO_STAFF_TICKET, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
            ],
        });

        const btnFechar = new ButtonBuilder().setCustomId('fechar_ticket').setLabel('Encerrar Atendimento').setEmoji('🔒').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(btnFechar);

        const embedAbertura = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle('✨ Novo Atendimento')
            .setDescription(`Olá **${interaction.user.username}**, seja bem-vindo ao suporte.\n\n> **Categoria:** ${categoria.toUpperCase()}\n> **Staff:** <@&${ID_CARGO_STAFF_TICKET}>\n\nPor favor, envie sua dúvida ou problema abaixo.`)
            .setThumbnail(interaction.guild.iconURL());

        await canal.send({ content: `${interaction.user} | <@&${ID_CARGO_STAFF_TICKET}>`, embeds: [embedAbertura], components: [row] });
        await interaction.editReply(`✅ Atendimento iniciado em ${canal}`);
    }

    // --- SISTEMA DE FECHAMENTO INOVADOR ---
    if (interaction.isButton() && interaction.customId === 'fechar_ticket') {
        const embedConfirm = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🛡️ Protocolo de Segurança')
            .setDescription('Você acionou o encerramento do ticket. Deseja confirmar esta ação?\n\n*O transcript será gerado e enviado aos logs automaticamente.*');

        const rowConfirm = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirmar_fechamento').setLabel('Confirmar Encerramento').setStyle(ButtonStyle.Success).setEmoji('🚀'),
            new ButtonBuilder().setCustomId('cancelar_fechamento').setLabel('Manter Aberto').setStyle(ButtonStyle.Secondary).setEmoji('↩️')
        );

        await interaction.reply({ embeds: [embedConfirm], components: [rowConfirm] });
    }

    if (interaction.isButton() && interaction.customId === 'cancelar_fechamento') {
        await interaction.message.delete().catch(() => {});
    }

    if (interaction.isButton() && interaction.customId === 'confirmar_fechamento') {
        await interaction.update({ content: '⚙️ **Processando arquivamento...**', embeds: [], components: [] });

        const logChannel = interaction.guild.channels.cache.get(ID_LOG_TICKETS); // LOG SETADO
        const file = await transcript.createTranscript(interaction.channel, { 
            fileName: `trans-magma-${interaction.channel.name}.html`, 
            saveImages: true,
            poweredBy: false 
        });

        const embedFinalLog = new EmbedBuilder()
            .setColor('#5865f2')
            .setAuthor({ name: 'Relatório de Atendimento', iconURL: interaction.guild.iconURL() })
            .addFields(
                { name: '📌 Canal', value: `\`${interaction.channel.name}\``, inline: true },
                { name: '👤 Usuário', value: `<@${interaction.channel.topic}>`, inline: true },
                { name: '🔐 Finalizado por', value: `${interaction.user}`, inline: true }
            )
            .setFooter({ text: 'Rede Magma - Segurança' })
            .setTimestamp();

        if (logChannel) await logChannel.send({ embeds: [embedFinalLog], files: [file] });

        const embedTchau = new EmbedBuilder()
            .setColor('#ff4757')
            .setTitle('👋 Atendimento Finalizado')
            .setDescription('O canal será removido em **5 segundos**.\nObrigado por preferir a **Rede Magma**!');

        await interaction.channel.send({ embeds: [embedTchau] });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// LOGS AUTOMÁTICOS
client.on('guildMemberAdd', member => {
    const log = member.guild.channels.cache.get(ID_LOGS_GERAL);
    if (log) log.send({ embeds: [new EmbedBuilder().setColor('#43b581').setDescription(`✅ **${member.user.tag}** pousou no servidor!`)] });
});

client.on('guildMemberRemove', member => {
    const log = member.guild.channels.cache.get(ID_LOGS_GERAL);
    if (log) log.send({ embeds: [new EmbedBuilder().setColor('#f04747').setDescription(`❌ **${member.user.tag}** deixou a rede.`)] });
});

client.once('ready', () => {
    console.log(`🚀 ${client.user.tag} está pronto para a Rede Magma!`);
    updateMinecraftStatus();
    setInterval(updateMinecraftStatus, 120000);
});

client.login(process.env.TOKEN);