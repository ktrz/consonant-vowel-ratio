# Consonant Vowel Ratio

## Initial setup

```shell
npm init
git init
touch .gitignore

npm i -D typescript @types/node
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm i -D prettier
npm i -D jest ts-jest @types/jest

echo \
'{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "ignorePatterns": ["dist/**"]
}' > .eslintrc.json

echo \
'{
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120
}' > .prettierrc.json

echo "dist" > .prettierignore

mkdir src
echo \
"function greeting(name: string) {
  console.log(\`Hello \${name}\`);
}

greeting('World')" > src/index.ts
```


```shell
echo \
"name: 'Consonant vowel ratio'
author: 'Chris Trzesniewski'
description: 'Consonant to vowel ratio GitHub action'

runs:
  using: 'node16'
  main: 'dist/index.js'
" > action.yml
```


### Install GitHub actions packages

```shell
npm i @actions/core @actions/github
```
