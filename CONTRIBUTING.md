# Contributing to *Cut the Rope: H5DX*

Thank you for your interest in contributing! Please take a moment to review this guide before submitting issues, feature requests, translation contributions, or pull requests.

> [!NOTE]
> This guide is not exhaustive. Project practices may evolve, and new situations may arise. When in doubt, feel free to ask questions or open an issue for clarification.

## 📬 Submitting issues, feature requests, or translations

To report bugs or request features, please [open an issue](https://github.com/yell0wsuit/cuttherope-h5dx/issues/new/choose) and choose the appropriate category.

## 🔀 Submitting pull requests

### 📌 Project note

- This project **does not use TypeScript** or any kind of static type checking yet.
  - In the meantime, use JSDoc comments to indicate types where applicable.

### ✅ What you should do

- **Use a code editor** (e.g., Visual Studio Code) to write and format code efficiently.

- **Format your code** before committing and pushing. You must use **Prettier with our configuration** to ensure consistent formatting.

- **Test your code thoroughly** before pushing. Resolve any ESLint errors if possible.

- **Use clear, concise variable names** written in `camelCase`. Names should be self-explanatory and reflect their purpose.

- **Use a clear, concise pull request title**. If possible, we recommend following [semantic commit message conventions](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716). Examples:
  - `fix: handle audio timeout error on older devices`
  - `feat: add pitch detection to feedback view`

  If the title doesn’t fully describe your changes, please provide a detailed description in the PR body.

- If you are working on your changes and they are not ready yet, consider using a **draft pull request**, and prefix the title with `[WIP]` (Work In Progress). When you feel it is ready, remove it and mark the PR as ready.

- Use **multiple small commits** with clear messages when possible. This improves readability and makes it easier to review specific changes.

- Before submitting a **large pull request** or major change, open an issue first and select the appropriate category. After a review by our team, you can start your work.

### 🧪 Review process

- All PRs are reviewed before merging. Please be responsive to feedback.  
  When resolving comments, **make a new commit with**:  
  `address feedback by @<username>`

### 🤔 What you should NOT do

- Submit pull requests that only include **cosmetic changes** like whitespace tweaks or code reformatting without any functional impact.  
  - These changes clutter diffs and make code reviews harder. [See this comment by the Rails team](https://github.com/rails/rails/pull/13771#issuecomment-32746700).
  - To avoid this, you should always use Prettier with our configuration before committing.

- Submit a pull request with **one or several giant commit(s)**. This makes it difficult to review.

- Use unclear, vague, or default commit messages like `Update file`, `fix`, or `misc changes`.

- Modify configuration files (e.g., `.prettierrc.json`, `eslint.config.js`, etc.), or any files in the `.github` folder without prior discussion.

### 🚫 Prohibited actions

- Add code that is unclear in intent or function.
- Add code or commits that:
  - Are **malicious** or **unsafe**  
  - **Executes scripts from external sources** associated with malicious, unsafe, or illegal behavior  
  - Attempts to introduce **backdoors** or hidden functionality

  If we find any code that violates these rules, you will be blocked from further contributions and reported to GitHub for Terms of Service violations.

- Use expletives or offensive language. This project is intended for everyone, and we strive to maintain a respectful environment for all contributors and users.

---

Thank you again for helping us improve the project!
