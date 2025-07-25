# `@tiaansu-dev/discord-markdown-parser`

> [!IMPORTANT]  
> This is the copy of [discord-markdown-parser](https://github.com/ItzDerock/discord-markdown-parser). This is just built with bun and is using latest version of [simple-markdown](https://npmjs.com/package/@khanacademy/simple-markdown).

[![npm](https://img.shields.io/npm/dw/@tiaansu/discord-markdown-parser)](http://npmjs.org/package/@tiaansu-dev/discord-markdown-parser)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Tiaansu/discord-markdown-parser)
![GitHub Repo stars](https://img.shields.io/github/stars/Tiaansu/discord-markdown-parser?style=social)

A node.js markdown implementation based on the [simple-markdown](https://npmjs.com/package/@khanacademy/simple-markdown) library, which is the same technology [discord use](https://discord.com/blog/how-discord-renders-rich-messages-on-the-android-app).

`@tiaansu-dev/discord-markdown-parser` will parse any given string into an [AST tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and supports:

-   links
-   block quotes
-   inline quotes
-   code blocks
-   inline code
-   italics (em)
-   spoilers
-   timestamps
-   bold
-   strikethrough
-   underline
-   channel mentions
-   user mentions
-   role mentions
-   @everyone
-   @here
-   emojis
-   & more

## Usage

```js
import { parse } from '@tiaansu-dev/discord-markdown-parser';
// or const { parse } = require('@tiaansu-dev/discord-markdown-parser');

// input is a string
const input = 'test **markdown** with `cool` *stuff*';

// specify what type of markdown this is
// this can be 'normal' or 'extended' (default = normal)
// extended should be used if the input is from a webhook message or embed description.
const type = 'normal';

// will return an AST tree
const parsed = parse(input, type);
```

## Extending

```js
// you can import the default rules using
import { rules } from '@tiaansu-dev/discord-markdown-parser';

// and you can add your own rules
const newRules = {
    ...rules,
    customRule: {
        ...
    } // see simple-markdown documentation for details
};

// import simpleMarkdown
import SimpleMarkdown from '@khanacademy/simple-markdown';

// and create the parser
const parser = SimpleMarkdown.parserFor(newRules);
```
