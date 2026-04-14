#!/usr/bin/env bash
#
# nuke-tenant.sh — Demo cleanup tool for NummyGo
#
# Lists all tenants and lets you pick one to delete.
# Deleting the owning User cascades through the entire chain:
#   User → account, session, tenant
#     Tenant → menu_item_categories, menu_items, orders, order_modifications
#       Order → order_items, order_modifications
#
# Usage:
#   ./scripts/nuke-tenant.sh                      # staging (default), interactive
#   ./scripts/nuke-tenant.sh --env production      # production
#   ./scripts/nuke-tenant.sh --user-id <ID>        # skip selection, nuke directly
#   ./scripts/nuke-tenant.sh --tenant-id <ID>      # look up user from tenant, then nuke
#
# Requirements: wrangler CLI authenticated + in the api-worker directory (or run from repo root)

set -euo pipefail

# ── Defaults ────────────────────────────────────────────────────────────────
ENV="staging"
DB_NAME="nummygo-db-staging"
USER_ID=""
TENANT_ID=""

# ── Parse args ──────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)        ENV="$2";        shift 2 ;;
    --user-id)    USER_ID="$2";    shift 2 ;;
    --tenant-id)  TENANT_ID="$2";  shift 2 ;;
    *)            echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# Map env to wrangler env name and DB
case "$ENV" in
  local|staging)   WRANGLER_ENV="staging"; DB_NAME="nummygo-db-staging" ;;
  production|prod) WRANGLER_ENV="production"; DB_NAME="nummygo-db-staging" ;;  # same db id in wrangler.jsonc
  *)               echo "Unknown env: $ENV"; exit 1 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

run_sql() {
  local sql="$1"
  wrangler d1 execute "$DB_NAME" --remote --env "$WRANGLER_ENV" --command "$sql" --json 2>/dev/null
}

run_sql_pretty() {
  local sql="$1"
  wrangler d1 execute "$DB_NAME" --remote --env "$WRANGLER_ENV" --command "$sql" 2>/dev/null
}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            🔥  NummyGo Tenant Nuke Tool  🔥                ║"
echo "║                                                            ║"
echo "║  Deletes a User and ALL related data via FK cascading:     ║"
echo "║  User → Sessions, Accounts, Tenant → Orders, Menu, etc.   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  Environment:  $ENV ($WRANGLER_ENV)"
echo "  Database:     $DB_NAME"
echo ""

cd "$WORKER_DIR"

# ── If --tenant-id given, resolve to user_id ────────────────────────────────
if [[ -n "$TENANT_ID" && -z "$USER_ID" ]]; then
  echo "🔍 Looking up user for tenant $TENANT_ID ..."
  result=$(run_sql "SELECT user_id FROM tenants WHERE id = '$TENANT_ID' LIMIT 1;")
  USER_ID=$(echo "$result" | node -e "
    const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    const rows = d?.[0]?.results ?? [];
    if (rows.length) console.log(rows[0].user_id);
  " 2>/dev/null || true)

  if [[ -z "$USER_ID" ]]; then
    echo "❌ Tenant not found: $TENANT_ID"
    exit 1
  fi
  echo "   → User ID: $USER_ID"
  echo ""
fi

# ── If no user/tenant specified, list all tenants ───────────────────────────
if [[ -z "$USER_ID" ]]; then
  echo "📋 Fetching tenants..."
  echo ""

  result=$(run_sql "SELECT t.id, t.name, t.slug, t.user_id, u.email, u.name as user_name FROM tenants t LEFT JOIN user u ON t.user_id = u.id ORDER BY t.name;")

  # Parse and display
  tenants_json=$(echo "$result" | node -e "
    const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    const rows = d?.[0]?.results ?? [];
    if (!rows.length) { console.error('No tenants found.'); process.exit(1); }
    rows.forEach((r, i) => {
      console.log(\`  [\${i + 1}]  \${r.name}  (\${r.slug})\`);
      console.log(\`       User: \${r.user_name ?? '—'} <\${r.email ?? '—'}>\`);
      console.log(\`       Tenant ID: \${r.id}\`);
      console.log(\`       User ID:   \${r.user_id}\`);
      console.log('');
    });
    // Output JSON for parsing
    console.error(JSON.stringify(rows));
  " 2>/tmp/nummygo_tenants.json)

  echo "$tenants_json"

  tenants_data=$(cat /tmp/nummygo_tenants.json 2>/dev/null || echo "[]")
  count=$(echo "$tenants_data" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).length)" 2>/dev/null || echo "0")

  if [[ "$count" == "0" ]]; then
    echo "No tenants found."
    exit 0
  fi

  echo -n "  Select tenant to delete [1-$count] (or 'q' to quit): "
  read -r selection

  if [[ "$selection" == "q" || "$selection" == "Q" ]]; then
    echo "Aborted."
    exit 0
  fi

  # Validate number
  if ! [[ "$selection" =~ ^[0-9]+$ ]] || (( selection < 1 || selection > count )); then
    echo "Invalid selection."
    exit 1
  fi

  USER_ID=$(echo "$tenants_data" | node -e "
    const rows = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    console.log(rows[$((selection - 1))].user_id);
  " 2>/dev/null)

  TENANT_NAME=$(echo "$tenants_data" | node -e "
    const rows = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    console.log(rows[$((selection - 1))].name);
  " 2>/dev/null)

  echo ""
  echo "  Selected: $TENANT_NAME (User: $USER_ID)"
fi

# ── Preview what will be deleted ────────────────────────────────────────────
echo ""
echo "📊 Previewing cascade impact..."
echo ""

# Count related records
preview=$(run_sql "
  SELECT
    (SELECT COUNT(*) FROM tenants WHERE user_id = '$USER_ID') as tenants,
    (SELECT COUNT(*) FROM orders WHERE tenant_id IN (SELECT id FROM tenants WHERE user_id = '$USER_ID')) as orders,
    (SELECT COUNT(*) FROM order_items WHERE tenant_id IN (SELECT id FROM tenants WHERE user_id = '$USER_ID')) as order_items,
    (SELECT COUNT(*) FROM order_modifications WHERE tenant_id IN (SELECT id FROM tenants WHERE user_id = '$USER_ID')) as order_mods,
    (SELECT COUNT(*) FROM menu_items WHERE tenant_id IN (SELECT id FROM tenants WHERE user_id = '$USER_ID')) as menu_items,
    (SELECT COUNT(*) FROM menu_item_categories WHERE tenant_id IN (SELECT id FROM tenants WHERE user_id = '$USER_ID')) as categories,
    (SELECT COUNT(*) FROM session WHERE user_id = '$USER_ID') as sessions,
    (SELECT COUNT(*) FROM account WHERE user_id = '$USER_ID') as accounts;
")

echo "$preview" | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const r = d?.[0]?.results?.[0] ?? {};
  console.log('  ┌─────────────────────────┬───────┐');
  console.log('  │ Table                   │ Rows  │');
  console.log('  ├─────────────────────────┼───────┤');
  console.log(\`  │ user                    │   1   │\`);
  console.log(\`  │ tenant                  │  \${String(r.tenants ?? 0).padStart(3)}  │\`);
  console.log(\`  │ orders                  │  \${String(r.orders ?? 0).padStart(3)}  │\`);
  console.log(\`  │ order_items             │  \${String(r.order_items ?? 0).padStart(3)}  │\`);
  console.log(\`  │ order_modifications     │  \${String(r.order_mods ?? 0).padStart(3)}  │\`);
  console.log(\`  │ menu_items              │  \${String(r.menu_items ?? 0).padStart(3)}  │\`);
  console.log(\`  │ menu_item_categories    │  \${String(r.categories ?? 0).padStart(3)}  │\`);
  console.log(\`  │ session                 │  \${String(r.sessions ?? 0).padStart(3)}  │\`);
  console.log(\`  │ account                 │  \${String(r.accounts ?? 0).padStart(3)}  │\`);
  console.log('  └─────────────────────────┴───────┘');
" 2>/dev/null

echo ""
echo "  ⚠️  This will PERMANENTLY delete the user and ALL records above."
echo ""
echo -n "  Type 'DELETE' to confirm: "
read -r confirm

if [[ "$confirm" != "DELETE" ]]; then
  echo "  Aborted."
  exit 0
fi

# ── Execute the nuke ────────────────────────────────────────────────────────
echo ""
echo "🗑️  Enabling foreign keys and deleting user $USER_ID ..."

# D1 requires PRAGMA foreign_keys = ON for cascades to fire
run_sql_pretty "PRAGMA foreign_keys = ON; DELETE FROM user WHERE id = '$USER_ID';"

echo ""
echo "✅ Done! User and all related data have been purged."
echo ""
