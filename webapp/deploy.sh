if [ ! -d "gh-pages" ]; then
  origin=$(git remote get-url origin)
  git clone --branch "gh-pages" "$origin" "gh-pages"
  code=0
  if [ $code != 0 ]; then
    mkdir "gh-pages"
    cd "gh-pages"
    git init
    git remote add origin "$origin"
    git checkout --orphan "gh-pages"
    git commit --allow-empty --message "create gh-pages"
    git push -u origin "gh-pages"
    cd ..
  fi
fi

yarn build

cd "gh-pages"
git pull
cp -r "../dist"/* .
git add .
git commit -m "gh-pages"
git push
