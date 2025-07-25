import SimpleMarkdown from '@khanacademy/simple-markdown';
import { extend } from '../utils/extend';

export const br = extend(
    {
        match: SimpleMarkdown.anyScopeRegex(/^\n/),
    },
    SimpleMarkdown.defaultRules.br
);
