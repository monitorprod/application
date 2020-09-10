#!/bin/sh

# build frontend
application=$(pwd)
cd $application/server
backend=$(pwd)
cd $backend/public
rm -r -v *
cd $backend/../client
frontend=$(pwd)
yarn build

# merge master to heroku
# cd $backend
# git checkout master
# git pull origin master
# git checkout heroku
# git merge master

# copy copy frontend/build to backend/public
cp -R $frontend/build/. $backend/public/

# publish to heroku
# cd $backend
# git add public/
# git commit -m "heroku commit"
# git push heroku heroku:master