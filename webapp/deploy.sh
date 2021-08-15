yarn build

cd "gh-pages"
git pull
cp -r "../dist"/* .
git add .
git commit -m "gh-pages"
git push
