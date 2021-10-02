# Contributing

We are open to, and grateful for, any contributions made by the community.

## Reporting Issues and Asking Questions

Before opening an issue, please search the [issue tracker](https://github.com/stordco/msw-toolbar/issues) to make sure your issue hasn't already been reported.

### Bugs and Improvements

We use the issue tracker to keep track of bugs and improvements to `msw-toolbar` itself, its examples, and the documentation. We encourage you to open issues to discuss improvements, architecture, theory, internal implementation, etc. If a topic has been discussed before, we will ask you to join the previous discussion.

### Building and Testing Locally

#### Building `msw-toolbar`

Running the `build` script will create both CJS/ESM builds for production and development environments.

```sh
yarn build
```

If you'd like to test your work locally, there are a few steps you can take:

1. Run `yarn start` which builds things in watch mode, then `link` this lib to another project with yarn or npm. Alternatively, you can use [yalc](https://github.com/wclr/yalc) which tends to be a better choice than yarn/npm-linking.
2. Use the example project and update it's usage to reflect your new features (and skip linking! :joy:)

### Examples

`msw-toolbar` comes with [an official example](https://github.com/stordco/msw-toolbar/tree/main/example) to demonstrate various concepts and best practices.

### Sending a Pull Request

For non-trivial changes, please open an issue with a proposal for a new feature or refactoring before starting on the work. We don't want you to waste your efforts on a pull request that we won't want to accept.

On the other hand, sometimes the best way to start a conversation _is_ to send a pull request. Use your best judgement!

In general, the contribution workflow looks like this:

- Open a new issue in the [Issue tracker](https://github.com/stordco/msw-toolbar/issues).
- Fork the repo.
- Create a new feature branch based off the `master` branch.
- Make sure all tests pass and there are no linting errors.
- Submit a pull request, referencing any issues it addresses.

For detailed steps on the above, [this is a good overview](https://www.gun.io/blog/how-to-github-fork-branch-and-pull-request).

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon as possible. We may suggest some changes or improvements.

Thank you for contributing!
