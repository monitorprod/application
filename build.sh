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

# copy copy frontend/build to backend/public
cp -R $frontend/build/. $backend/public/
