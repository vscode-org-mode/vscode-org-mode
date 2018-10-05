[![Version](https://vsmarketplacebadge.apphb.com/version/tootone.org-mode.svg)](https://marketplace.visualstudio.com/items?itemName=tootone.org-mode)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/tootone.org-mode.svg)](https://marketplace.visualstudio.com/items?itemName=tootone.org-mode)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/tootone.org-mode.svg)](https://marketplace.visualstudio.com/items?itemName=tootone.org-mode)

# VS Code Org Mode

VS Code Org Mode is an extension for Visual Studio Code inspired by the venerable [Org mode for Emacs](http://orgmode.org/). Org lets you keep notes, maintain TODO lists, and author documents, all in plain text.

The extension is currently in alpha. We welcome issues, feature requests, and contributions to the [repo](https://github.com/jsonreeder/vscode-org-mode).

## Features

### Keep Notes

Create outlines:

![outlines](img/screenshots/01_outlines.gif)

Promote and demote items:

![promote_demote](img/screenshots/02_promote_demote.gif)

### Maintain TODO Lists

Create TODOs:

![create todos](img/screenshots/03_create_todos.gif)

Change TODO status:

![cycle todo status](img/screenshots/04_cycle_todo_status.gif)

Customize your TODO Keywords:

![custom todos](img/screenshots/05_customize_todo_keywords.gif)

Insert timestamps:

![timestamps](img/screenshots/06_insert_timestamps.gif)

Modify dates:

![modify dates](img/screenshots/07_modify_dates.gif)

### Author Documents

Style your text:

![style text](img/screenshots/08_style_text.gif)

Add metadata with a snippet:

![add metadata](img/screenshots/09_add_metadata.gif)

Add links with a snippet:

![add links](img/screenshots/10_add_links.gif)

Add comments:

![add comments](img/screenshots/11_add_comments.gif)

## Settings

### Keybindings

All actions in VS Code Org mode come packaged with default keybindings. These can be modified in your `keybindings.json` file.

### Custom TODO Keywords

TODO keywords can be customized in `settings.json`. For example:
```json
"org.todoKeywords": [
    "TODO",
    "DONE",
    "WAIT",
    "SCHD"
]
```

## Installation

Org Mode can be installed in a number of ways:
  - Launch VS Code Quick Open (Linux / Windows: <kbd>ctrl</kbd>+<kbd>P</kbd>; Mac: <kbd>cmd</kbd>+<kbd>P</kbd>) and type `ext install org-mode`.
  - Search for `org mode` in the `Extensions` view in VS Code.

![install](img/screenshots/14_install.gif)

## Activation

The extension can be activated in two ways:
1. Save a file with the extension `.org`.
2. Change the language mode to `Org` by either
    - Clicking in the lower right corner to the left of the smiley face
    - Typing `change language mode` into the command palette
    - Using the default shortcut
        - Linux / Windows: <kbd>ctrl</kbd>+<kbd>k</kbd> <kbd>m</kbd>
        - Mac: <kbd>cmd</kbd>+<kbd>k</kbd> <kbd>m</kbd>

## Docs

Detailed documentation is kept in the [GitHub Wiki](https://github.com/jsonreeder/vscode-org-mode/wiki).

## Contributing

We welcome contributions to the GitHub repo. Here are basic guidelines for conventions.

### Naming

The full name of this project is `VS Code Org Mode`. It is abbreviated `vscode-org-mode`. In the VS Code Marketplace, it is listed as `Org Mode`.

Commands are prefixed with `org.` and followed by camel case, eg `org.insertHeadingRespectContent`. Command titles are prefixed with `Org: ` and followed by capitalized words separated by spaces, eg `Org: Insert Heading Respect Content`.

Filenames use kebab case, eg `header-functions.ts`.

When referring to the original Org mode, we capitalize the "O" and leave the "m" lower case. This is in keeping with the original team's usage on [orgmode.org](http://orgmode.org/).

### Code

Use TSLint with default settings.

### Git

- `master` is used for production deploys.
- `develop` is the main branch into which new features are merged. It is protected from direct pushes, so all changes come from pull requests.
- Features: For all new additions, create a new feature branch. When complete, create a pull request into `develop` for that branch. Optionally, prefix feature branch names with `feature/`.

## Gratitude

The original Org mode was written for Emacs by Carsten Dominik, with the help and support of [an impressive list of geniuses](http://orgmode.org/org.html#History-and-Acknowledgments). Our work is inspired by though not associated with their original masterpiece. In addition, many aspects of the extension were inspired by [the Spacemacs Org layer](https://github.com/syl20bnr/spacemacs/tree/master/layers/%2Bemacs/org).

Our unicorn icon is based on an image by [M. Turan Ercan](https://thenounproject.com/mte/) for [the Noun Project](https://thenounproject.com/). We're grateful to them for making the image available under the Creative Commons license.

## License

This work is available under the [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html).

## Requirements

Install the extension. The rest will be taken care of.

## Known Issues

### Colorization

Colorization, bolding, italicization, and other modes of highlighting are handled differently by different themes. We have prioritized supporting the default VS Code themes (Dark+ and Light+). This prioritization means that some colors may not appear as expected in other themes, or that opportunities for more variance have been missed.

### Others

See [GitHub Issues](https://github.com/jsonreeder/vscode-org-mode/issues).

## Release Notes

See [CHANGELOG.md](https://github.com/jsonreeder/vscode-org-mode/blob/develop/CHANGELOG.md).
