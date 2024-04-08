#!/bin/bash

APP_NAME="app.thinkmachine.com"

# Check if the first argument is "--deploy"
if [[ $1 == "--deploy" ]]; then
  FORCE_DEPLOY=true
else
  FORCE_DEPLOY=false
fi

UPDATES=$(git pull)

# Check if updates are found or if forced to deploy
if [[ $UPDATES != *"Already up to date"* ]] || [[ $FORCE_DEPLOY == true ]]; then
  npm install
  npm run build

  if pm2 list | grep -q $APP_NAME; then
    pm2 restart $APP_NAME
  else
    NODE_ENV=production pm2 start src/server/server.js --name $APP_NAME
  fi
else
  echo "No updates found. Nothing to do."
fi

