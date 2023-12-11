// CHECKPOINT
require("dotenv").config();
const fs = require('fs');
const { Client, IntentsBitField, EmbedBuilder, ChannelType } = require("discord.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

let storeData = [];
let cartUser = {};

// Cargar datos existentes de ItemInfo.json al inicio
try {
    const rawData = fs.readFileSync('ItemInfo.json');
    storeData = JSON.parse(rawData);
} catch (error) {
    console.error('Error reading ItemInfo.json:', error);
}

// Cargar datos existentes de cartUser.json al inicio
try {
    const rawData = fs.readFileSync('cartUser.json');
    cartUser = JSON.parse(rawData);
} catch (error) {
    console.error('Error reading cartUser.json:', error);
}

client.on("ready", () => {
    console.log(`${client.user.tag} está listo.`);
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === "newitem") {
        const isAdmin = interaction.member.permissions.has("Administrator");

        // Verificar si el usuario que ejecutó el comando es un administrador
        if (!isAdmin) {
            return interaction.reply("Solo los administradores pueden usar este comando.");
        }

        const channel = interaction.options.getChannel("channel");
        const name = interaction.options.getString("name");
        const price = interaction.options.getNumber("price");
        const image = interaction.options.getString("image");

        if (!image) {
            return interaction.reply("Debes proporcionar una imagen del item.");
        }

        const embed = new EmbedBuilder()
            .setTitle(name)
            .setDescription(`Price: ${price} $`)
            .setImage(image)
            .setColor("#0099ff");

        const sentMessage = await channel.send({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 3,
                            label: "✔️ Add to Cart",
                            custom_id: "send_application"
                        },
                        {
                            type: 2,
                            style: 4,
                            label: "❌ Remove",
                            custom_id: "send_application2"
                        },
                        {
                            type: 2,
                            style: 1,
                            label: "🛒 Checkout",
                            custom_id: "send_application3"
                        }
                    ]
                }
            ]
        });

        const ItemInfo = {
            messageId: sentMessage.id,
            name,
            price,
            image,
        };

        storeData.push(ItemInfo);

        fs.writeFileSync('ItemInfo.json', JSON.stringify(storeData, null, 2));
        interaction.reply("Item añadido correctamente.");
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const buttonId = interaction.customId;
    const messageId = interaction.message.id;

    // Leer el archivo JSON para obtener la información del artículo
    let storeData;
    try {
        const rawData = fs.readFileSync('ItemInfo.json');
        storeData = JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading ItemInfo.json:', error);
        return interaction.reply({ content: 'Error: Unable to read item information.', ephemeral: true });
    }

    // Buscar la información del artículo según el messageId
    const selectedItem = storeData.find(item => item.messageId === messageId);

    if (!selectedItem) {
        return interaction.reply({ content: 'Error: Item not found.', ephemeral: true });
    }

    // Obtener el carrito del usuario desde el archivo cartUser.json
    let cartUser = {};
    try {
        const rawData = fs.readFileSync('cartUser.json');
        cartUser = JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading cartUser.json:', error);
    }

    const userId = interaction.user.id;

    // Manejar la lógica según el botón presionado
    if (buttonId === 'send_application') {
        // Agregar el artículo al carrito del usuario
        if (!cartUser[userId]) {
            cartUser[userId] = [];
        }

        const existingItem = cartUser[userId].find(item => item.messageId === messageId);
        if (existingItem) {
            // Si el artículo ya está en el carrito, aumentar la cantidad
            existingItem.amount = (existingItem.amount || 1) + 1;
        } else {
            // Si el artículo no está en el carrito, agregarlo con cantidad 1
            cartUser[userId].push({ ...selectedItem, amount: 1 });
        }

        fs.writeFileSync('cartUser.json', JSON.stringify(cartUser, null, 2));

        // Calcular el total y responder con el mensaje apropiado
        const total = cartUser[userId].reduce((sum, item) => sum + item.price * item.amount, 0);
        await interaction.reply({ content: `Item ${selectedItem.name} added to your cart! Total: $${total}`, ephemeral: true });
    } else if (buttonId === 'send_application2') {
        // Quitar el artículo del carrito del usuario
        if (cartUser[userId]) {
            const itemIndex = cartUser[userId].findIndex(item => item.messageId === messageId);
            if (itemIndex !== -1) {
                const item = cartUser[userId][itemIndex];
                // Si hay más de un artículo, reducir la cantidad; si es uno, eliminarlo
                if (item.amount && item.amount > 1) {
                    item.amount -= 1;
                } else {
                    cartUser[userId].splice(itemIndex, 1);
                }

                fs.writeFileSync('cartUser.json', JSON.stringify(cartUser, null, 2));

                // Calcular el total y responder con el mensaje apropiado
                const total = cartUser[userId].reduce((sum, item) => sum + item.price * item.amount, 0);
                await interaction.reply({ content: `Item ${selectedItem.name} removed from your cart! Total: $${total}`, ephemeral: true });
            } else {
                await interaction.reply({ content: 'Error: Item not found in your cart.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Error: Your cart is empty.', ephemeral: true });
        }
    } else if (buttonId === 'send_application3') {
        // Realizar el checkout
        const total = cartUser[userId]?.reduce((sum, item) => sum + item.price * item.amount, 0) || 0;
        if (total >= 4) {
            // Crear un canal después del checkout
            const guild = interaction.guild;
            const checkoutChannelName = `checkout-${Math.floor(Math.random() * 900000) + 100000}`;
    
            guild.channels.create({
                name: checkoutChannelName,
                type: ChannelType.GuildText,
                parent: "1169070934506885181",
                // Agrega otras opciones o permisos según tus necesidades
            }).then(async checkoutChannel => {
                // Puedes enviar un mensaje inicial en el nuevo canal
                await checkoutChannel.send(`Checkout successful! Total: $${total}`);
    
                // Agregar los elementos del carrito al canal uno por uno
                const userCart = cartUser[userId] || [];
                for (const item of userCart) {
                    const itemTotal = item.price * item.amount;
                    const itemEmbed = new EmbedBuilder()
                        .setTitle(item.name)
                        .setDescription(`Price: $${item.price}, Amount: ${item.amount}, Total: $${itemTotal}`)
                        .setImage(item.image)
                        .setColor("#0099ff");
    
                    await checkoutChannel.send({ embeds: [itemEmbed] });
                }
    
                // Puedes enviar el total general al final
                await checkoutChannel.send(`Total: $${total}`);
    
                // Agregar permisos al usuario que interactuó con el botón
                await checkoutChannel.permissionOverwrites.create(interaction.user, { ViewChannel: true });
    
                // También puedes limpiar el carrito después del checkout
                delete cartUser[userId];
                fs.writeFileSync('cartUser.json', JSON.stringify(cartUser, null, 2));
    
                await interaction.reply({ content: `Checkout successful! Check your new channel: ${checkoutChannel}`, ephemeral: true });
            }).catch(error => {
                console.error('Error creating checkout channel:', error);
                interaction.reply({ content: 'Error creating checkout channel.', ephemeral: true });
            });
        } else {
            await interaction.reply({ content: 'Error: Minimum purchase amount is $4.', ephemeral: true });
        }
    }
});

client.login("token");
