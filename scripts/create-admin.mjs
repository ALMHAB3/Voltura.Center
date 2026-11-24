// Creates the first admin, or promotes an existing account to admin.
// Usage: node --env-file=.env.local scripts/create-admin.mjs <email> [password]
// Uses SUPABASE_SERVICE_ROLE_KEY, so run it only on your own machine or server.
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> [password]");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function findUser(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (found || data.users.length < 200) return found;
  }
}

let user = await findUser(email);
if (!user) {
  if (!password || password.length < 8) {
    console.error("No account with that email. Pass a password (8+ characters) to create one.");
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "مدير المتجر" },
  });
  if (error) throw error;
  user = data.user;
  console.log(`Created ${email}`);
}

const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
if (error) throw error;
console.log(`${email} is now an admin. Sign in at /account/login, then open /admin.`);
