# Social Care Interoperability Standards - Deployment & Troubleshooting

A quick guide to running, validating, and deploying the standards website.

---

## 1. Local Development (Docker)

To run the dev server locally:

```bash
docker compose up
```

Once running, view the site at **`http://localhost:4000`**.

---

## 2. Testing & Validation

Compile the site locally before pushing. The build runs the link-checking
plugins, which fail on any broken internal or external link:

```bash
docker compose run --rm build
```

Data validation lives in
[SocialCareData/validator](https://github.com/SocialCareData/validator), not here.
It checks records against the shapes published to
[SocialCareData/ontology](https://github.com/SocialCareData/ontology):

```bash
npx @socialcaredata/validator -p placements yourdata.jsonld
```

If you have changed a LinkML schema under `src/_data/model/`, regenerate the
artifacts and confirm the build is clean:

```bash
pip install -r src/assets/scripts/requirements.txt
python src/assets/scripts/build_ontology.py --out build/ontology
```

---

## 3. Production Deployment

Any changes pushed to the `main` branch are automatically built and deployed to **`standard.socialcaredata.io`** via GitHub Actions. No manual deployment is required.

---

## 4. Troubleshooting Common Docker Issues on Windows

If the site isn't loading on `localhost:4000`, run `docker compose logs` to check for errors.

### A. "Gemfile.lock is locked to x64-mingw..." (Windows Platform Mismatch)
*   **Fix**: Run the following command in your terminal to add Linux support to the lockfile:
    ```bash
    docker compose run --rm socialcaredata-jekyll bundle lock --add-platform x86_64-linux
    ```

### B. WSL2 Localhost Loading Issues
*   **Fix**: Try opening **`http://127.0.0.1:4000`** in your browser instead of `localhost:4000`.

### C. File Changes are Not Live-Reloading
*   **Fix**: Update `docker-compose.yml` to force polling. Change the start command to:
    ```yaml
    command: ["jekyll", "serve", "--host", "0.0.0.0", "--force_polling"]
    ```
