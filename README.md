# What is this?

A simple scaffholding tool for creating a new project to be published to npm.  
It provides a build command that will compile your code to a CommonJS Node 14.16 target, allowing named imports for CommonJS packages inside ESM files.  
The package contains a simple "hello world" based on TypeScript, built on esbuild, tested through Jest and linted with ESLint and Prettier.  
It also provides a Husky pre-commit hook to run the linter and tests before committing.

## What does it mean?

If you try to run `npm run build` you will be able to import the `sayHello` function from the `index.js` file, both via `require` and `import` syntax.

### Importing via `require`

```js
const { sayHello } = require('my-package');
```

### Importing via `import`

```js
import { sayHello } from 'my-package';
```

# Why?

I got tired of copying and pasting the same files over and over again.  
This is a simple tool to create a new project with the basic files needed to publish to npm.

# How can I personalize it?

You can change the `package.json` file to your liking, bringing your own package name and description.  
Please, remember to give me a star if you like the project!

## How To Install?

```bash
git clone git://github.com/Cadienvan/npm-package-ts-scaffholding.git package_name
cd package_name
npm install
```

## What's Inside?

- Typescript
- Jest
- Eslint
- Prettier
- Husky
- Esbuild
