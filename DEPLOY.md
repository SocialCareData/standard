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

Always run these two checks before pushing your changes:

### A. Check for Broken Links
Compile the site locally to run the automated link-checking plugins:
```bash
docker compose run --rm build
```

### B. Validate JSON-LD Data Schemas
Run the automated SHACL schema validator:
```bash
cd src/assets/shacl/validation
npm install
npm run validate
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
