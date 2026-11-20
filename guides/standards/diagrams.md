# Data model diagrams (Miro)

Each standard page shows a data model diagram near the top. The diagrams are drawn in Miro and saved in the repository as SVG.

## Boards

| Standard | Board |
| --- | --- |
| Person | [miro.com/app/board/uXjVHHDbTfk=](https://miro.com/app/board/uXjVHHDbTfk=/) |
| Placements | [miro.com/app/board/uXjVHd7-ka0=](https://miro.com/app/board/uXjVHd7-ka0=/) |
| Safeguarding | [miro.com/app/board/uXjVH93l8Mk=](https://miro.com/app/board/uXjVH93l8Mk=/) |

Ask an editor for access if you can't open a board.

## Update a diagram

1. Change the diagram on the board. Keep class and property names the same as in the LinkML model.
2. Select the frame that holds the diagram.
3. Click **Export > SVG**.
4. Name the file `<standard>-data-model-<YYYY-MM-DD>.svg`, for example `safeguarding-data-model-2026-10-21.svg`.
5. Save it in `src/assets/img/<standard>/`.
6. Change the image path on the standard page:

```html
<p class="data-model-diagram"><img src="/assets/img/safeguarding/safeguarding-data-model-2026-10-21.svg" alt="Safeguarding Data Model" title="Safeguarding Data Model" style="width: 70%; height: auto;" /></p>
```

## Tips

- Start the path with `/assets/...` and use forward slashes (`/`), not backslashes (`\`).
- Don't delete an old image if an older version of the page still uses it. Search the repository for the file name first.
- Use the date in the name rather than overwriting the old file. Browsers can cache images, and a new name avoids that.
- Change `width` to suit the diagram. Wide diagrams look better at `90%` or more.
- Check the diagram on the preview site, in both light and dark mode.

