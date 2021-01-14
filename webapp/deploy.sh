if [ ! -d "gh-pages" ]; then
  git clone --branch "gh-pages" $(git remote get-url origin) "gh-pages"
  code=$?
  if [ $code != 0 ]; then
    git clone $(git remote get-url origin) "gh-pages"
    cd "gh-pages"
    git checkout --orphan gh-pages
    cd ..
  fi
fi

yarn build

rm -r "gh-pages"/*
cp -r "dist"/* "gh-pages"

cd "gh-pages"
git add .
git commit -m "gh-pages"
git push -u origin gh-pages
