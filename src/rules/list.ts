const LIST_BULLET = '(?:[*-]|\\d+\\.)';
const LIST_ITEM_PREFIX = '( *)(' + LIST_BULLET + ')( +)';
const LIST_ITEM_PREFIX_R = new RegExp('^' + LIST_ITEM_PREFIX);
const LIST_LOOKBEHIND_R = /(?:^|\n)( *)$/;

import SimpleMarkdown, {
    SingleASTNode,
    type ParserRule,
} from '@khanacademy/simple-markdown';

export const extend = (
    additionalRules: Partial<ParserRule>,
    defaultRule: ParserRule
): ParserRule => {
    return Object.assign({}, defaultRule, additionalRules);
};

export const list: ParserRule = extend(
    {
        match: (source, state) => {
            if ((state._listDepth ?? 0) >= 10) return null;

            const prevCaptureStr = state.prevCapture?.[0] ?? '';
            const isStartOfLineCapture = LIST_LOOKBEHIND_R.exec(prevCaptureStr);
            if (!isStartOfLineCapture) return null;

            const matches: string[] = [];
            const lines = source.split('\n');

            let i = 0;
            let sawItem = false;
            let blankLineCount = 0;

            while (i < lines.length) {
                const line = lines[i];

                if (LIST_ITEM_PREFIX_R.test(line)) {
                    matches.push(line);
                    i++;
                    sawItem = true;
                    blankLineCount = 0;
                    continue;
                }

                if (line.trim() === '') {
                    if (!sawItem) break; // don't start with blanks
                    if (blankLineCount >= 1) break; // stop on second blank
                    matches.push(line);
                    blankLineCount++;
                    i++;
                    continue;
                }

                if (sawItem) {
                    matches.push(line); // likely indented multiline item
                    i++;
                } else {
                    break; // non-list content before any list item
                }
            }

            if (matches.length === 0) return null;
            return [matches.join('\n')];
        },

        parse: (capture, parse, state) => {
            const lines = capture[0].replace(/\n+$/, '').split('\n');

            type ItemBlock = {
                indent: number;
                raw: string[];
            };

            const blocks: ItemBlock[] = [];

            for (let i = 0; i < lines.length; ) {
                const match = LIST_ITEM_PREFIX_R.exec(lines[i]);
                if (!match) {
                    i++;
                    continue;
                }

                const indent = match[1].length;
                const block: ItemBlock = { indent, raw: [lines[i++]] };

                while (
                    i < lines.length &&
                    (!LIST_ITEM_PREFIX_R.test(lines[i]) ||
                        LIST_ITEM_PREFIX_R.exec(lines[i])![1].length > indent)
                ) {
                    block.raw.push(lines[i++]);
                }

                blocks.push(block);
            }

            const maxDepth = 10;
            const currentDepth = (state._listDepth ?? 0) + 1;
            const parsedItems: SingleASTNode[][] = [];

            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                const firstLine = block.raw[0]
                    .replace(LIST_ITEM_PREFIX_R, '')
                    .trim();
                const rest = block.raw
                    .slice(1)
                    .map((l) => l.slice(block.indent + 2))
                    .join('\n');
                let full = [firstLine, rest].filter(Boolean).join('\n');

                const nextState = {
                    ...state,
                    _list: true,
                    _listDepth: currentDepth,
                };

                if (currentDepth < maxDepth) {
                    parsedItems.push(parse(full, nextState));
                    continue;
                }

                if (currentDepth === maxDepth) {
                    // Check if the content would create deeper nesting
                    // by looking for nested list items in the full content
                    const lines = full.split('\n');
                    const contentItems = [firstLine];

                    // Look for any nested list items in the rest content
                    for (const line of lines.slice(1)) {
                        if (LIST_ITEM_PREFIX_R.test(line)) {
                            const nestedContent = line
                                .replace(LIST_ITEM_PREFIX_R, '')
                                .trim();
                            if (nestedContent) {
                                contentItems.push(nestedContent);
                            }
                        }
                    }

                    // Create flattened content
                    const flattenedContent = contentItems.join('- ');

                    // Parse just the flattened content as plain text
                    parsedItems.push([
                        {
                            type: 'text',
                            content: flattenedContent,
                        },
                    ]);
                    continue;
                }

                // This shouldn't be reached but keeping as fallback
                break;
            }

            const firstBullet = LIST_ITEM_PREFIX_R.exec(lines[0])?.[2] ?? '*';
            const ordered = /^\d+\.$/.test(firstBullet);
            const start = ordered ? parseInt(firstBullet, 10) : 1;

            return {
                type: 'list',
                ordered,
                start,
                items: parsedItems,
                depth: currentDepth,
            };
        },
    },
    SimpleMarkdown.defaultRules.list
);
