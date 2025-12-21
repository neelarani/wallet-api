#!/bin/bash

CONDITION=$1

# Generate timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

tsc --build
tsc-alias
echo "application has been builded"

git add .
git commit -m "chore(auto): auto commit - latest build: $TIMESTAMP"

case $CONDITION in
"force")
  echo "Forcefully pushing to GitHub and GitLab..."
  git push gh master -f &
  git push gl master -f &
  ;;
*)
  echo "Pushing to GitHub and GitLab..."
  git push gh master &
  git push gl master &
  ;;
esac

wait
echo "Push complete to both remotes."
