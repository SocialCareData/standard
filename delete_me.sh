#!/usr/bin/env bash
# One-off manual equivalent of .github/workflows/ontology-sync.yml.
# Everything is done inside .ontology-sync-tmp/ and removed on exit.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$ROOT/.ontology-sync-tmp"
ONTOLOGY_REPO="SocialCareData/ontology"
BRANCH="manual-sync-from-standard-$(date +%Y%m%d-%H%M%S)"

cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

# Avoid leaving __pycache__ in the repo or wheels in ~/Library/Caches/pip.
export PYTHONDONTWRITEBYTECODE=1
export PIP_NO_CACHE_DIR=1
export PIP_DISABLE_PIP_VERSION_CHECK=1

cd "$ROOT"
rm -rf "$WORK"
mkdir -p "$WORK"

PYTHON=""
for candidate in python3.13 python3.12 python3.11 python3; do
  if command -v "$candidate" >/dev/null 2>&1 &&
     "$candidate" -c 'import sys, lzma; sys.exit(sys.version_info < (3, 11))' 2>/dev/null; then
    PYTHON="$candidate"
    break
  fi
done
if [ -z "$PYTHON" ]; then
  echo "error: need Python >= 3.11 with the lzma module (brew install xz, then reinstall Python)." >&2
  exit 1
fi
echo "==> Using $("$PYTHON" --version)"

SHA="$(git rev-parse HEAD)"
SOURCE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ -n "$(git status --porcelain -- src/_data/model src/assets/scripts)" ]; then
  echo "warning: uncommitted changes under src/_data/model or src/assets/scripts will be included."
  SHA="$SHA-dirty"
fi

echo "==> Installing LinkML toolchain"
"$PYTHON" -m venv "$WORK/venv"
"$WORK/venv/bin/pip" install --quiet -r src/assets/scripts/requirements.txt

echo "==> Generating ontology and shapes"
"$WORK/venv/bin/python" src/assets/scripts/build_ontology.py --out "$WORK/build"

ontlogy_version="$("$WORK/venv/bin/python" -c "import yaml;print(yaml.safe_load(open('src/_data/model/social-care/manifest.yml'))['ontlogy_version'])")"

echo "==> Cloning $ONTOLOGY_REPO"
git clone --quiet "https://github.com/$ONTOLOGY_REPO.git" "$WORK/ontology"

rsync -a --delete \
  --exclude '.git/' \
  --exclude '/.github/' \
  --exclude '/README.md' \
  --exclude '/LICENSE' \
  --exclude '/examples/' \
  "$WORK/build/" "$WORK/ontology/"

cd "$WORK/ontology"
git add -A
if git diff --cached --quiet; then
  echo "No changes - the ontology repo is already up to date."
  exit 0
fi

echo "==> Changes to be proposed:"
git --no-pager diff --cached --stat
read -r -p "Commit, push branch '$BRANCH' and open a PR? [y/N] " answer
case "$answer" in
  [yY]*) ;;
  *) echo "Aborted; nothing pushed."; exit 0 ;;
esac

git checkout --quiet -b "$BRANCH"
git commit --quiet -m "Sync ontology from standard@$SHA" -m "Generated manually from SocialCareData/standard branch $SOURCE_BRANCH."
git push --quiet -u origin "$BRANCH"

TITLE="Sync ontology from standard (MAIS $ontlogy_version)"
BODY="Regenerated manually from the LinkML schemas in SocialCareData/standard branch \`$SOURCE_BRANCH\` at \`$SHA\`.

> Generated files - review the diff, but make corrections in the LinkML YAML upstream rather than here."

if command -v gh >/dev/null 2>&1; then
  gh pr create --repo "$ONTOLOGY_REPO" --head "$BRANCH" --title "$TITLE" --body "$BODY"
else
  echo "Open the PR at: https://github.com/$ONTOLOGY_REPO/compare/$BRANCH?expand=1"
fi

rm -f "$ROOT/delete_me.sh"
echo "Done. Temporary files and delete_me.sh removed."
