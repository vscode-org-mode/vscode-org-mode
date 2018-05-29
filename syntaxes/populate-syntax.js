// Script that populate syntax with list of language
const fs = require('fs');

const programmingLanguages = [
    ['js', 'javascript'],
    ['ts', 'typescript'],
    ['java'],
    ['python', 'py', 'gyp']
];

const markupLanguages = [
    ['source.yaml', 'yaml', 'yml'],
    ['source.json', 'json'],
    ['text.xml', 'xml'],
    ['text.html.markdown', 'markdown', 'md'],
    ['source.org', 'orgmode', 'org'],
    ['text.html.basic', 'html', 'htm', 'shtml', 'xhtml', 'inc', 'tmpl', 'tpl']
];

const generateDefinitionForProgrammingLanguage = language =>
    generateBlockSourceDefinition(language[0], language.join('|'), `source.${language[0]}`);

const generateDefinitionForMarkupLanguage = language =>
    generateBlockSourceDefinition(language[1], language.slice(1).join('|'), language[0]);

const generateBlockSourceDefinition = (scope, match, sourceLanguage) => {
    var basePattern = {
        name: `meta.block.source.${scope}.org`,
        begin: `(?i)(#\\+BEGIN_SRC)\\s+(${match})\\b\\s*(.*)$`,
        end: "(?i)(#\\+END_SRC)$",
        beginCaptures: {
            "1": {
                "name": "keyword.control.block.org"
            },
            "2": {
                "name": "constant.other.language.org"
            },
            "3": {
                "name": "string.other.header-args.org"
            }
        },
        endCaptures: {
            "1": {
                "name": "keyword.control.block.org"
            }
        },
        patterns: [
            {
                "begin": "(^|\\G)(\\s*)(.*)",
                "while": "(^|\\G)(?!\\s*#\\+END_SRC\\s*)",
                "contentName": `meta.embedded.block.${scope}`
            }
        ]
    }
    if (sourceLanguage)
        basePattern.patterns[0].patterns = [
            {
                "include": sourceLanguage
            }
        ];
    return basePattern;
};

const generateGrammar = () => {
    const grammarTemplate = fs.readFileSync(`${__dirname}/org.tmLanguage.template.json`);
    const jsonGrammar = JSON.parse(grammarTemplate);
    const languageDefinitions = programmingLanguages.map(generateDefinitionForProgrammingLanguage)
        .concat(markupLanguages.map(generateDefinitionForMarkupLanguage));
    languageDefinitions.push(generateBlockSourceDefinition('unknown', '\\w+', null))
    jsonGrammar.repository['src-block'].patterns = languageDefinitions;
    fs.writeFileSync(`${__dirname}/org.tmLanguage.json`, JSON.stringify(jsonGrammar, null, 4));
};

if (!module.parent) {
    console.log('Regenerating the grammar')
    generateGrammar();
}