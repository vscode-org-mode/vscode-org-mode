# VS Code Org Mode

VS Code Org Mode (`vscode-org-mode`) is an extension for Visual Studio Code that allows users to read and write `.org` files.

The extension is currently in development and has not yet been released to the VS Code Marketplace. The development docs are available [here](docs/README.org).

Initial release is estimated for `[2017-04-10 Mon]`. For updates, star this repo.

## How to

The extension can be activated in two ways:
1. Save a file with the extension `.org`
2. Change the language mode to `Org` by either
    - Click in the lower right corner to the left of the smiley face
    - Type `change language mode` into the command palette
    - Using the default shortcut <kbd>cmd</kbd>+<kbd>k</kbd> <kbd>m</kbd>

### Keybindings

We recommend the following keybindings. To set them, add them to your `keybindings.json` file.

```json
[
    {
        "key": "shift+right",
        "command": "org.incrementContext",
        "when": "editorLangId == 'org'"
    },{
        "key": "shift+left",
        "command": "org.decrementContext",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+enter",
        "command": "org.insertHeadingRespectContent",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+c shift+1",
        "command": "extension.insertTimestamp",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+c b",
        "command": "org.bold",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+c i",
        "command": "org.italic",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+c u",
        "command": "org.underline",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+c c",
        "command": "org.code",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+c v",
        "command": "org.verbose",
        "when": "editorLangId == 'org'"
    },{
        "key": "ctrl+c l",
        "command": "org.literal",
        "when": "editorLangId == 'org'"
    }
]
```


## Contributing

Guidelines for contributing are coming soon. Also, see Git conventions below.

## Conventions

### Naming

The full name of this project is `VS Code Org Mode`. It is abbreviated `vscode-org-mode`. In the VS Code Marketplace, it is listed as `Org Mode`.

Commands are prefixed with `org.` and followed by camel case, eg `org.insertHeadingRespectContent`. Command titles are prefixed with `Org: ` and followed by capitalized words separated by spaces, eg `Org: Insert Heading Respect Content`.

Filenames use kebab case.

When referring to the original Org mode, we capitalize the "O" and leave the "m" lower case. This is in keeping with the original teams usage on [orgmode.org](http://orgmode.org/).

### Code

Use TSLint with default settings.

### Git

- `master` is used for production deploys.
- `develop` is the main branch into which new features are merged. It is protected from direct pushes, so all changes come from pull requests.
- Features: For all new additions, create a new feature branch. When complete, create a pull request into `develop` for that branch. Optionally, prefix feature branch names with `feature/`.

## Gratitude

The original Org mode was written for Emacs by Carsten Dominik, with the help and support of [an impressive list of geniuses](http://orgmode.org/org.html#History-and-Acknowledgments). Our work is inspired by though not associated with their original masterpiece.

## License
This work is available under the [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html).

## Features

Features description coming soon.

## Requirements

Requirements description coming soon.

## Extension Settings

Settings description coming soon.

## Known Issues

### Folding

VS Code's folding strategy is based on indentation. There is no indentation in Org. There are a number of feature requests to allow for header-level folding:
- [language-aware folding #3422](https://github.com/Microsoft/vscode/issues/3422)
- [Add code folding for markdown based on heading level #3347](https://github.com/Microsoft/vscode/issues/3347)

Until Microsoft addresses those issues, it appears to be impossible to implement folding in Org.

### Colorization

Colorization, bolding, italicization, and other modes of highlighting are handled differently by different themes. We have prioritized supporting the default VS Code themes (Dark+ and Light+). This prioritization means that some colors may not appear as expected in other themes, or that opportunities for more variance have been missed.

### Additional

Feel free to call out issues using the `Issues` tab above.

## Release Notes

Release notes coming soon.
