const repo = 'redshoxx/ave96';
const endpoint = `https://api.github.com/repos/${repo}/releases`;

const getReleaseData = async() => {
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};

function pad(s) { return (s < 10) ? '0' + s : s; }

const extractAssets = (data) => {
  const assets = data.map(release => {
    const d = new Date(release.published_at);
    return {
      version: release.name,
      url: release.html_url,
      date: [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear() % 100].join('/'),
      arm64: release.assets.find(asset => asset.name.toLowerCase().includes("arm64")),
      armeabi: release.assets.find(asset => asset.name.toLowerCase().includes("armeabi")),
      universal: release.assets.find(asset => asset.name.toLowerCase().includes("universal") || asset.name.toLowerCase().includes("fat")),
      ios: release.assets.find(asset => asset.name.toLowerCase().includes("ios")),
      macos: release.assets.find(asset => asset.name.toLowerCase().includes("macos")),
      windows: release.assets.find(asset => asset.name.toLowerCase().includes("windows")),
    };
  });
  return assets;
};

window.onload = async() => {
  const releaseData = await getReleaseData();
  const tableBody = document.querySelector('.table-body');
  try {
    if (releaseData.message) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">${releaseData.message.split("(")[0]} You can still check latest release on <a href="https://github.com/sangwan5688/blackHole/releases/latest/">GitHub</a></td></tr>`;
      return;
    } else {
      const finalData = await extractAssets(releaseData);
      let finalHtml = '';
      finalData.forEach((release) => {
        let rowHtml = '';

        Object.entries(release).forEach(([platform, asset]) => {
          if (platform === 'version' || platform === 'url' || platform === 'date') {
            return;
          }
          const platformClass = (platform === 'arm64' || platform === 'armeabi' || platform == 'universal') ? 'android' : platform;
          if (asset) {
            rowHtml += `<td class="${platformClass}"><a class="btn btn-outline-light btn-sm" role="button" href=${asset.browser_download_url}>Download</a></td>`
          } else {
            rowHtml += `<td class="${platformClass} text-muted">N/A</td>`
          }
        });

        finalHtml +=
          `<tr>
          <td><a class="text-white" href=${release.url}>${release.version}</a></td>
          <td class="text-muted">${release.date}</td>
          ${rowHtml}
        </tr>`;
      });
      tableBody.innerHTML = finalHtml;
    }
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Failed to load data. You can still check latest release on <a href="https://github.com/redshoxx/ave96/releases/latest/">GitHub</a></td></tr>`;
  }
}
