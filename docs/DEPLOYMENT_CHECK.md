# Deployment check

This RC intentionally disables Service Worker caching.

After replacing the repository contents and deploying, the page header **must** show:

`v9.0.13 Deploy Safe`

If the site still shows `v9.0.10 Study RC`, the deployed Vercel build is not using this repository revision.

`BUILD_ID.txt` can also be opened directly in the deployed project to verify the build.
