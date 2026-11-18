# Run the site on your computer (optional)

This is optional. For most changes the [preview site](getting-set-up.md#7-check-the-build) on your pull request is enough. Running the site locally lets you see changes straight away, without pushing.

## Steps

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and open it.
2. In GitHub Desktop, go to **Repository > Open in Terminal** (on Windows: **Open in Command Prompt**).
3. Run:

   ```sh
   docker compose up
   ```

   The first run takes a few minutes.
4. When you see `Server running...`, open [http://localhost:4000](http://localhost:4000).
5. Edit and save files as usual. The site rebuilds automatically, so refresh the browser to see your changes.
6. To stop, press `Ctrl+C` in the terminal.

If something goes wrong, see the troubleshooting section in [DEPLOY.md](../DEPLOY.md).
