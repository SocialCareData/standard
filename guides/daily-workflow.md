# Daily workflow

A quick reference for working on a task, from start to merge. One task = one branch = one copy of the project.

You need [GitHub Desktop](https://desktop.github.com), [VS Code](https://code.visualstudio.com/download) and [Git](https://git-scm.com/downloads) installed, and write access to the repository (see [Getting set up](getting-set-up.md)).

## 1. Clone the project

1. In GitHub Desktop, go to **File > Clone repository** and pick `SocialCareData/standard`.
2. Set **Local path** to a new folder named after the task, for example `standard-add-pilot-article`.
3. Click **Clone**.

Working on more than one task? Clone again into a different folder.

## 2. Create a branch

1. In GitHub Desktop, go to **Branch > New branch**.
2. Type a short name, for example `add-pilot-article`, and click **Create branch**.
3. Go to **Repository > Open in Visual Studio Code**.

From here on, work in VS Code.

## 3. Make changes, commit and push

1. Edit and save files.
2. Open **Source Control** in the left sidebar (`Ctrl+Shift+G`).
3. Type a short message, for example `Add pilot article`, and click **Commit**.
4. Click **Publish Branch** the first time, then **Sync Changes** after that.

Commit and push as often as you like.

## 4. Open a pull request

1. Go to [github.com/SocialCareData/standard](https://github.com/SocialCareData/standard).
2. Click **Compare & pull request** on the yellow banner. If it's not there, go to **Pull requests > New pull request** and pick your branch.
3. Add a title and a short description, then click **Create pull request**.
4. Under **Reviewers** on the right, add at least one person.

## 5. Check the build and preview

1. Near the bottom of the pull request, wait for **CI** and **PR preview** to show a green tick. If one fails, see [When a check fails](getting-set-up.md#when-a-check-fails).
2. Open the preview link from the pull request comments.
3. Read through your changes and click every link you added or changed.

Do this again after every push.

## 6. Respond to feedback

1. Make the changes in VS Code.
2. Commit and click **Sync Changes**, as in step 3.
3. Check the build and preview again, as in step 5.

The pull request updates by itself. Reply to the review comments on GitHub if needed.

## 7. Merge

1. Once approved and all checks are green, click **Merge pull request**, then **Confirm merge**.
2. Your remote branch will be automatically deleted when merged.

## 8. Clean up

Close VS Code. In GitHub Desktop, go to **Repository > Remove**, tick the option to also move the folder to the bin, and click **Remove**. For the next task, start again from step 1.

## Help

- [Source control in VS Code](https://code.visualstudio.com/docs/sourcecontrol/overview)
- [Creating a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [Merging a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request)
