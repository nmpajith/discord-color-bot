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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const API = "https://discord.com/api/v10";
const HEADERS = { Authorization: `Bot ${TOKEN}`, "Content-Type": "application/json" };

async function setRoleColor(color) {
  const res = await fetch(`${API}/guilds/${GUILD_ID}/roles/${ROLE_ID}`, {
    method: "PATCH", headers: HEADERS, body: JSON.stringify({ color }),
  });
  if (res.status === 429) {
    const data = await res.json();
    const wait = Math.ceil((data.retry_after ?? 1) * 1000);
    console.log(`Rate limited — waiting ${wait}ms`);
    await sleep(wait);
    return setRoleColor(color);
  }
  if (!res.ok) throw new Error(`Discord error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  const meRes = await fetch(`${API}/users/@me`, { headers: HEADERS });
  if (!meRes.ok) throw new Error("Invalid bot token!");
  const me = await meRes.json();
  console.log(`Logged in as ${me.username}`);

  const roleRes = await fetch(`${API}/guilds/${GUILD_ID}/roles`, { headers: HEADERS });
  const roles = await roleRes.json();
  const role = roles.find((r) => r.id === ROLE_ID);
  if (!role) throw new Error(`Role ${ROLE_ID} not found!`);
  console.log(`Cycling colors on: "${role.name}"`);

  let colorIndex = 0;
  while (true) {
    const color = COLORS[colorIndex % COLORS.length];
    colorIndex++;
    try {
      await setRoleColor(color);
      console.log(`Color: #${color.toString(16).padStart(6, "0")}`);
    } catch (err) {
      console.error("Error:", err.message);
      await sleep(5000);
    }
    await sleep(3000);
  }
}

main().catch((err) => { console.error("Fatal:", err.message); process.exit(1); });
