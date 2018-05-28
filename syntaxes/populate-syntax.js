// Script that populate syntax with list of language
const fs = require('fs');

const languages = [
    ['js', 'javascript'],
    ['ts', 'typescript'],
    ['java'],
    ['python', 'py']
];

const generateDefinitionForLanguage = language => ({
    "name": `meta.block.source.${language[0]}.org`,
    "begin": `(?i)(#\\+BEGIN_SRC)\\s+(${language.join('|')})\\b\\s*(.*)$`,
    "end": "(?i)(#\\+END_SRC)$",
    "beginCaptures": {
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
    "endCaptures": {
        "1": {
            "name": "keyword.control.block.org"
        }
    },
    "patterns": [
        {
            "include": `source.${language[0]}`
        }
    ]
});

const generateGrammar = () => {
    const grammarTemplate = fs.readFileSync(`${__dirname}/org.tmLanguage.template.json`);
    const jsonGrammar = JSON.parse(grammarTemplate);
    jsonGrammar.repository['src-block'].patterns = languages.map(generateDefinitionForLanguage);
    fs.writeFileSync(`${__dirname}/org.tmLanguage.json`, JSON.stringify(jsonGrammar, null, 4));
};

if (!module.parent) {
    console.log('Regenerating the grammar')
    generateGrammar();
}