// Script that populate syntax with list of language
const fs = require('fs');

const programmingLanguages = [
    ['js', 'javascript', 'mjs', 'es6', 'jsx'],
    ['js.regexp', 'regexp'],
    ['ts', 'typescript'],
    ['tsx'],
    ['java'],
    ['python', 'py','py3','rpy','pyw','cpy','SConstruct','Sconstruct','sconstruct','SConscript','gyp','gypi'],
    ['regexp.python', 're'],
    ['css'],
    ['lua'],
    ['ini', 'conf', 'properties'],
    ['makefile', 'Malefile'],
    ['perl', 'pl', 'pm'],
    ['r', 'R', 's', 'S', 'Rprofile'],
    ['ruby', 'rb', 'rbx', 'rjs', 'Rakefile', 'rake', 'cgi', 'fcgi', 'gemspec', 'irbrc', 'Capfile', 'ru', 'prawn', 'Cheffile', 'Gemfile', 'Guardfile', 'Hobofile', 'Vagrantfile', 'Appraisals', 'Rantfile', 'Berksfile', 'Berksfile.lock', 'Thorfile', 'Puppetfile'],
    ["php", "php3", "php4", "php5", "phpt", "phtml", "aw", "ctp"],
    ['sql', 'ddl', 'dml'],
    ['asp.vb.net', 'vb'],
    ['dosbatch', 'batch', 'bat'],
    ['clojure', 'clj', 'cljs'],
    ['coffee', 'Cakefile', 'coffe.erb'],
    ['c', 'h'],
    ['cpp', 'c\\+\\+', 'cxx'],
    ['objc', 'objectivec', 'objective-c', 'mm', 'm', 'obj-c'],
    ['diff', 'patch', 'rej'],
    ['dockerfile', 'Dockerfile'],
    ['go', 'golang'],
    ['groovy', 'gvy'],
    ['pug', 'jade'],
    ['css.less', 'less'],
    ['css.scss', 'scss'],
    ['perl.6', 'perl6', 'p6', 'pl6', 'pm6', 'nqp'],
    ['rust', 'rs'],
    ['scala', 'sbt'],
    ['shell', 'sh', 'bash', 'zsh', 'bashrc', 'bash_profile'],
    ['cs','csharp','c#'],
    ['fs','fsharp','f#'],
    ['dart']
];
// List of language retrieve from https://github.com/Microsoft/vscode/blob/master/extensions/markdown-basics/syntaxes/markdown.tmLanguage.json
// Preproced by the following jq command: jq '.repository.block.repository|to_entries[]|{block: .key, names: .value.begin, source: .value.patterns[0].patterns[0].include?}'

const markupLanguages = [
    ['source.yaml', 'yaml', 'yml'],
    ['source.json', 'json'],
    ['text.xml', 'xml', 'xsd', 'tld', 'jsp', 'pt', 'cpt', 'dtml', 'rss', 'opml'],
    ['text.xml.xsl', 'xsl', 'xslt'],
    ['text.html.markdown', 'markdown', 'md'],
    ['source.org', 'orgmode', 'org'],
    ['text.html.basic', 'html', 'htm', 'shtml', 'xhtml', 'inc', 'tmpl', 'tpl'],
    ['text.git-commit', 'COMMIT_EDITMSG', 'MERGE_MSG'],
    ['text.git-rebase', 'git-rebase-todo']
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