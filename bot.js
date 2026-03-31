import { Client, GatewayIntentBits } from "discord.js";
import http from "http";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ROLE_ID = process.env.DISCORD_ROLE_ID;

if (!TOKEN) throw new Error("DISCORD_BOT_TOKEN is not set");
if (!GUILD_ID) throw new Error("DISCORD_GUILD_ID is not set");
if (!ROLE_ID) throw new Error("DISCORD_ROLE_ID is not set");

const PORT = process.env.PORT || 3000;
http.createServer((_, res) => res.end("Bot is running!")).listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

const COLORS = [
  0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x00ffff,
  0x0000ff, 0x8800ff, 0xff00ff, 0xff0088, 0x00ff88,
];

let colorIndex = 0;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user?.tag}`);
  const guild = await client.guilds.fetch(GUILD_ID);
  const role = await guild.roles.fetch(ROLE_ID);
  if (!role) { console.error("Role not found!"); process.exit(1); }
  console.log(`Cycling colors on: "${role.name}"`);
  setInterval(async () => {
    const color = COLORS[colorIndex % COLORS.length];
    colorIndex++;
    try {
      await role.edit({ color });
      console.log(`Color: #${color.toString(16).padStart(6, "0")}`);
    } catch (err) {
      console.error("Error:", err?.message ?? err);
    }
  }, 1000);
});

client.on("error", (err) => console.error("Client error:", err));
client.login(TOKEN);
