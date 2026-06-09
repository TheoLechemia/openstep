#!/usr/bin/env bash
#
# Crée la base de données PostGIS d'OpenStep (rôle + base + extension).
#
# Les identifiants (NAME / USER / PASSWORD) sont lus directement dans
# backend/openstep/openstep/config.py (copié depuis config.py.sample), donc le
# script reste toujours synchronisé avec la configuration de l'application.
#
# Doit être lancé par un utilisateur ayant les droits superuser sur PostgreSQL
# (par défaut le rôle `postgres`). En local :
#
#     sudo -u postgres ./backend/scripts/create_db.sh
#
# Surcharge possible via variables d'env (prioritaires sur config.py) :
#
#     DB_NAME=... DB_USER=... DB_PASS=... ./create_db.sh
#
set -euo pipefail

# Chemin du config.py, résolu relativement à l'emplacement de ce script.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_PY="${SCRIPT_DIR}/../openstep/openstep/config.py"

if [[ ! -f "${CONFIG_PY}" ]]; then
   echo "ERREUR : config.py introuvable à '${CONFIG_PY}'." >&2
   echo "         Copiez-le depuis le sample :" >&2
   echo "         cp backend/openstep/openstep/config.py.sample ${CONFIG_PY}" >&2
   exit 1
fi

# Lecture des identifiants depuis config.py via Python (parsing fiable, sans
# importer Django : on charge uniquement ce fichier comme un module isolé).
read_db_setting() {
   python3 - "${CONFIG_PY}" "$1" <<'PY'
import importlib.util, sys
path, key = sys.argv[1], sys.argv[2]
spec = importlib.util.spec_from_file_location("openstep_config", path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
print(mod.DATABASES["default"][key])
PY
}

DB_NAME="${DB_NAME:-$(read_db_setting NAME)}"
DB_USER="${DB_USER:-$(read_db_setting USER)}"
DB_PASS="${DB_PASS:-$(read_db_setting PASSWORD)}"

echo "==> Configuration lue : base='${DB_NAME}', rôle='${DB_USER}'"

echo "==> Création du rôle '${DB_USER}' (s'il n'existe pas)"
psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
   END IF;
END
\$\$;
SQL

echo "==> Création de la base '${DB_NAME}' (s'elle n'existe pas)"
if ! psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1; then
   createdb -O "${DB_USER}" "${DB_NAME}"
fi

echo "==> Activation de l'extension PostGIS sur '${DB_NAME}'"
psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# PostgreSQL 15+ : le schéma public n'est plus accessible en écriture aux
# rôles non-propriétaires. On rend le rôle applicatif propriétaire pour qu'il
# puisse créer ses tables lors des migrations Django.
echo "==> Attribution des droits sur le schéma public à '${DB_USER}'"
psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" <<SQL
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
GRANT ALL ON SCHEMA public TO ${DB_USER};
SQL

echo "==> Terminé. Lancez ensuite :"
echo "      cd backend/openstep && python manage.py migrate"
