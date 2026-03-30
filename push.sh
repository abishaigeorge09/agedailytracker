#!/bin/bash
cd "$(dirname "$0")"
git add data.json
git commit -m "Update dashboard — $(date '+%b %d, %Y %I:%M %p')"
git push origin main
echo "✅ Dashboard updated and deployed!"
