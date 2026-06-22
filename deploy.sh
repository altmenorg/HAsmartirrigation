#!/usr/bin/env bash
#
# Déploie le module smart_irrigation vers Home Assistant (HAOS) pour test.
#
# Méthode : tar-over-ssh (PAS rsync — le poste de dev Windows/Git-Bash n'a pas
# de binaire rsync local, et rsync doit tourner des deux côtés).
#
# Pré-requis :
#   - alias SSH `haos` dans ~/.ssh/config -> root@192.168.1.9 (clé haos_mesepices)
#   - clé publique dans l'option authorized_keys de l'add-on SSH HAOS
#
# Usage :
#   ./deploy.sh              # backup distant horodaté + remplacement propre du module
#   ./deploy.sh --restart    # idem + redémarre HA Core (ha core restart)
#   ./deploy.sh --no-backup  # remplace sans créer de backup distant
#
# Le dossier serveur est REMPLACÉ intégralement (rm -rf puis extraction) pour
# garantir un état cohérent — d'où le backup distant par défaut.
#
set -euo pipefail

SSH_HOST="${HAOS_SSH_HOST:-haos}"
REMOTE_BASE="/config/custom_components"
MODULE="smart_irrigation"

cd "$(dirname "$0")/custom_components"

DO_BACKUP=1
DO_RESTART=0
for arg in "$@"; do
  case "$arg" in
    --restart)   DO_RESTART=1 ;;
    --no-backup) DO_BACKUP=0 ;;
    *) echo "Option inconnue : $arg" >&2; exit 1 ;;
  esac
done

echo "==> Construction du tarball (sous-ensemble déployable)"
TARBALL="$(mktemp -t si_deploy.XXXXXX).tar.gz"
trap 'rm -f "$TARBALL"' EXIT
tar czf "$TARBALL" \
  --exclude="${MODULE}/tests" \
  --exclude="${MODULE}/__pycache__" \
  --exclude='*.pyc' \
  --exclude="${MODULE}/frontend/src" \
  --exclude="${MODULE}/frontend/node_modules" \
  --exclude="${MODULE}/frontend/localize" \
  --exclude="${MODULE}/frontend/package.json" \
  --exclude="${MODULE}/frontend/package-lock.json" \
  --exclude="${MODULE}/frontend/rollup.config.js" \
  --exclude="${MODULE}/frontend/eslint.config.js" \
  --exclude="${MODULE}/frontend/tsconfig.json" \
  --exclude="${MODULE}/requirements.test.txt" \
  "${MODULE}"

# Note : on GARDE frontend/dist/*.map (sourcemap du build minifié, utile au debug).

if [ "$DO_BACKUP" -eq 1 ]; then
  STAMP="$(date +%Y%m%d-%H%M%S)"
  echo "==> Backup distant : ${MODULE}.backup-${STAMP}"
  ssh "$SSH_HOST" "cd ${REMOTE_BASE} && [ -d ${MODULE} ] && cp -a ${MODULE} ${MODULE}.backup-${STAMP} || true"
fi

echo "==> Déploiement (remplacement propre) vers ${SSH_HOST}:${REMOTE_BASE}/${MODULE}"
cat "$TARBALL" | ssh "$SSH_HOST" "cd ${REMOTE_BASE} && rm -rf ${MODULE} && tar xzf - && echo '    extraction OK'"

echo "==> Vérif manifest"
ssh "$SSH_HOST" "grep -E 'name|version' ${REMOTE_BASE}/${MODULE}/manifest.json"

if [ "$DO_RESTART" -eq 1 ]; then
  echo "==> Redémarrage de HA Core (patiente ~1-2 min)"
  ssh "$SSH_HOST" "ha core restart"
  echo "==> Pense au hard refresh navigateur (Ctrl+F5) pour le frontend JS."
else
  echo "==> Fichiers poussés. Pour appliquer :"
  echo "    - recharge l'intégration (Paramètres > Appareils & services > Happy Irrigation > Recharger)"
  echo "      ou ./deploy.sh --restart pour un restart complet"
  echo "    - hard refresh navigateur (Ctrl+F5) pour le frontend."
fi

echo "==> Terminé."
