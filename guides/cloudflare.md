# Cloudflare Setup

Cloudflare pages is used to deploy Pull Request previews. See [.github/workflows/pr-preview.yml](.github/workflows/pr-preview.yml)

## Access Pages Deployments

Login to https://dash.cloudflare.com

On the Left menu: `Build > Compute > Workers & Pages`

## Initial project creation

Create a Cloudflare account.

Create a dummy deployment content:

```sh
mkdir my_deployment
cd my_deployment
echo '<p>Preview host for socialcaredata/standard PRs.</p>' > index.html
```

Create the project and deploy.

```sh
npx wrangler login
npx wrangler pages project create socialcaredata-standard-preview --production-branch=main
wrangler pages deploy ./my_deployment
```

The site should be ready at https://socialcaredata-standard-preview.pages.dev/

### Create an API token

Prefer an **account-owned** token — it survives the person who created it leaving the team.

1. **Manage Account → Account API Tokens → Create Token → Create Custom Token**. (If that
   section isn't visible, fall back to **My Profile → API Tokens**; a user-owned token
   works but dies with the user.)
2. Name: `github-actions-pages-preview`.
3. Permissions — exactly two rows, nothing more:
   - `Account` · `Cloudflare Pages` · **Edit**
   - `Account` · `Account Settings` · **Read**
4. Account Resources: **Include → <your account>**.
5. Client IP Address Filtering: leave empty (GitHub runner IPs are not stable).
6. TTL: leave as-is, or set a 1-year expiry with a calendar reminder to rotate.
7. **Continue to summary → Create Token**, then copy it. It is shown **once**.

### Add the GitHub secrets and variable

Repo → **Settings → Secrets and variables → Actions**:

| Kind | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | the token |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | the Account ID |
| Variable | `CF_PAGES_PROJECT` | `socialcaredata-standard-preview` |


### Test deployment (Optional)

```sh
npx wrangler pages deploy dist --project-name=socialcaredata-standard-preview --branch=pr-test --commit-dirty=true
```

Open https://pr-test.socialcaredata-standard-preview.pages.dev
