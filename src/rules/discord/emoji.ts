import SimpleMarkdown, { type ParserRule } from '@khanacademy/simple-markdown';
import { EmojiRegex } from '../../utils/regex';

export const emoji: ParserRule = {
    order: SimpleMarkdown.defaultRules.strong.order,
    match: (source) => EmojiRegex.exec(source),
    parse: function (capture) {
        return {
            animated: capture[1] === 'a',
            name: capture[2],
            id: capture[3],
        };
    },
};
