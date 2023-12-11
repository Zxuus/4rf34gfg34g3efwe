require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandOptionType } = require("discord-api-types/v10");

const commands = [
    {
        name: "newitem",
        description: "Añade un nuevo item en la tienda.",
        options: [
            {
                name: "channel",
                description: "Añade el canal donde se añadirá el item.",
                type: ApplicationCommandOptionType.Channel,
                required: true,
            },
            {
                name: "name",
                description: "Ponle un nombre al item a vender.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "price",
                description: "Ponle un precio al item a vender.",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "image",
                description: "Adjunta una imagen del item.",
                type: ApplicationCommandOptionType.String, // Assuming a string for the image URL
                required: true,
            },
        ],
        defaultPermission: false,
        
    },
];

const rest = new REST({ version: "10" }).setToken("MTE4MjY5ODM3MjI4NTU5OTc2NA.GdVW0k.lLjkOb0IFywDDyCAoUwqf5meLrkY5UfotvXYaQ");

(async () => {
    try {
        console.log("Revisando los comandos...");

        // Obtén el client ID y el guild ID desde tus variables de entorno
        const clientId = "1182698372285599764";
        const guildId = "1169046512236515340";

        // Registra los comandos con los permisos predeterminados (defaultPermission: false)
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log("Comandos revisados.");
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();
