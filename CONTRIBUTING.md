# Contributing to IntelliPy

Thank you for your interest in contributing to IntelliPy! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

- Use the [GitHub Issues](https://github.com/vsdhaka/intellipy/issues) page
- Check if the issue already exists
- Include VS Code version, IntelliPy version, and OS
- Provide steps to reproduce

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: add new feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

### Commit Convention

We use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/maintenance tasks

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/intellipy.git
cd intellipy

# Install dependencies
npm install

# Run TypeScript compiler in watch mode
npm run watch

# Open VS Code
code .

# Press F5 to run extension in development
```

### Code Style

- Use TypeScript
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Ensure no linting errors

### Testing

- Add tests for new features
- Ensure existing tests pass
- Test with multiple LLM providers

## Questions?

Feel free to open an issue or discussion for any questions!