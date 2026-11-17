# Issues and feedback

Every change to a standard should be traceable to an issue, so people can see why it was made.

## Where issues come from

- **The "Report an issue" section** on each standard page (`{% include report-issue.html %}`). It opens a new issue with the page URL already filled in.
- **"Raise an issue about this change"** buttons on diff pages. They fill in the title and page for the table that changed.
- **Working group meetings.** Raise an issue for each decision that changes the standard.
- **GitHub directly:** [New issue](https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml).

All of these use the **Content / standard issue** template. Pick the **Standards** category.

## Write a good issue

- **Title:** the standard and the field, for example `Placements: allow "Not known" for pets`.
- **Affected page or section:** link to the property, for example `https://standard.socialcaredata.io/PUB00_placements_standard#requirements-pets`.
- **What is wrong:** the problem, not the fix.
- **Suggested change:** the new field, code or wording, if you have one.
- **References:** links to legislation, national code lists or meeting notes.

## Link issues to changes

- In the pull request description, write `Closes #123` so the issue closes when the pull request merges.
- On a diff page, add a short reason under the table with a link to the issue:

```markdown
* Removed the free-text fields to mitigate Information Governance and data privacy risks. [Issue #19](https://github.com/SocialCareData/standard/issues/19)
```

- Add a line to the page's `changelog` in the front matter.

## Help

- [GitHub: creating an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue)
- [GitHub: linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
