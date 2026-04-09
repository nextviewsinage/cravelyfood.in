#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py migrate --no-input
python manage.py seed_all || true
python manage.py remove_nonveg || true
python manage.py setup_production || true
python manage.py seed_surge_rules || true
python manage.py collectstatic --no-input --clear 2>/dev/null || true
