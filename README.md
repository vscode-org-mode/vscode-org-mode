# VS Code Org Mode

![unicorn logo](docs/img/logo.png)

VS Code Org Mode (`vscode-org-mode`) is an extension for Visual Studio Code that allows users to read and write `.org` files.

The extension is currently in development and has not yet been released to the VS Code Marketplace. The development docs are available [here](docs/README.org).

Initial release is estimated for `[2017-04-10 Mon]`. For updates, star this repo.

## Contributing

Guidelines for contributing are coming soon. Also, see Git conventions below.

## Conventions

### Naming

The full name of this project is `VS Code Org Mode`. It is abbreviated `vscode-org-mode`. In the VS Code Marketplace, it is listed as `Org Mode`.

Actions are prefixed with `org-`.

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

Our unicorn icon is based on an image by [M. Turan Ercan](https://thenounproject.com/mte/) for [the Noun Project](https://thenounproject.com/). We're grateful to them for making the image available under the Creative Commons license.

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
