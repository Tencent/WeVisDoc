# WeVisDoc project page

Source for the [WeVisDoc project page](https://tencent.github.io/WeVisDoc). It presents the 2B and 4B open-model releases, benchmark results, the training method, and twelve interactive qualitative cases. Read the [technical report](https://arxiv.org/abs/2609.20423) on arXiv.

## Local development

Node.js 22.13.0 or newer is required.

```bash
source /root/.nvm/nvm.sh
nvm use 22.13.1
npm ci
npm run dev
```

## Validation

```bash
npm run lint
npm test
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the static export whenever the `page` branch is pushed.

For the first deployment, open the repository's **Settings → Pages** and select **GitHub Actions** as the source. Then push this branch:

```bash
git push -u origin page
```

The project page will be published at <https://tencent.github.io/WeVisDoc/>.
