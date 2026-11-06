# Getting set up and making changes

You only need to do steps 1–3 once.

## 1. Get access

You need a [GitHub account](https://github.com/signup). Send your username to one of the admins and ask for write access to the [SocialCareData/standard](https://github.com/SocialCareData/standard) repository.

## 2. Install GitHub Desktop

Download it from [desktop.github.com](https://desktop.github.com) and sign in with your GitHub account.

Help: [Installing GitHub Desktop](https://docs.github.com/en/desktop/installing-and-authenticating-to-github-desktop/installing-github-desktop)

## 3. Clone the project

In GitHub Desktop, go to **File > Clone repository**, pick `SocialCareData/standard` and choose a folder on your computer.

Help: [Cloning a repository](https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-a-repository-from-github-to-github-desktop)

## 4. Create a branch

Never work directly on `main`. For each change:

1. Make sure **Current branch** is `main`, then click **Fetch origin** to get the latest version.
2. Go to **Branch > New branch** and give it a short name, for example `add-pilot-article`.
3. Edit the files in any text editor (for example [VS Code](https://code.visualstudio.com/)).
4. Back in GitHub Desktop, write a short summary at the bottom left and click **Commit**.
5. Click **Publish branch** (or **Push origin** after the first time).

Help: [Managing branches](https://docs.github.com/en/desktop/making-changes-in-a-branch/managing-branches-in-github-desktop), [Committing changes](https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop)

## 5. Open a pull request

1. In GitHub Desktop, click **Create Pull Request**. It opens GitHub in your browser.
2. Add a title and a short description of what changed.
3. Click **Create pull request**.
4. On the right, click **Reviewers** and add at least one person.

Your changes go live only after a reviewer approves and the pull request is merged.

Help: [Requesting a review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/requesting-a-pull-request-review)

## 6. Check the build

Each pull request runs automatic checks. You can see them near the bottom of the pull request page.

- **CI** builds the site and checks for broken links.
- **PR preview** builds a preview of the site. When it's ready, a comment with the link appears on the pull request, for example `https://pr-12.socialcaredata-standard-preview.pages.dev`. Use it to check your changes.

A green tick means everything passed. A red cross means something failed.

### When a check fails

1. Click **Details** next to the failed check.
2. Open the step with the red cross and scroll to the red error lines.
3. Common causes:
   - a broken link (a page URL that doesn't exist, or an external site that's down)
   - a typo or wrong indentation in the front matter or `_config.yml`
4. Fix the file, commit and push again. The checks run again automatically.

### Re-running a check

Some failures are temporary, for example an external website that didn't respond. To try again, open the failed check and click **Re-run jobs > Re-run failed jobs** at the top right.

Help: [Re-running workflows](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/re-running-workflows-and-jobs)

If you're stuck, ask an admin in the pull request comments.
