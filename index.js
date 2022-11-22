const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');
const fs = require('fs');

const YOUTUBE_URL = 'https://youtube.googleapis.com';

main().then(() => console.log('finished'));

async function main() {
  const apiKey = core.getInput('api-key');
  console.log('apiKey=***')
  const playlistId = core.getInput('playlist-id');
  console.log(`playlist-id=${playlistId}`);
  const thumbnailSize = core.getInput('thumbnail-size');
  console.log(`thumbnailSize=${thumbnailSize}`);
  const outputPath = core.getInput('output-path');
  console.log(`outputPath=${outputPath}`);
  const outputFilenameTemplate = core.getInput('output-filename-template');
  console.log(`outputFilenameTemplate=${outputFilenameTemplate}`);
  const outputContentTemplate = core.getInput('output-content-template');
  console.log(`outputContentTemplate=${outputContentTemplate}`);

  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`payload=${payload}`);

  console.log('Fetching videos...');
  try {
    await fetchVideos(apiKey, playlistId, thumbnailSize, outputPath, outputFilenameTemplate, outputContentTemplate);
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

async function fetchVideos(apiKey, playlistId, thumbnailSize, outputPath, outputFilenameTemplate, outputContentTemplate) {
  let data = await fetchPage(apiKey, playlistId, null);
  const items = data.items;
  while (data.nextPageToken !== undefined) {
    data = await fetchPage(apiKey, playlistId, data.nextPageToken);
    items.push(...data.items);
  }

  items
    .filter(item => Object.keys(item.snippet.thumbnails).length !== 0)
    .forEach(item => {
      const content = template(outputContentTemplate, item, thumbnailSize);
      const filename = template(outputFilenameTemplate, item, thumbnailSize);
      fs.mkdirSync(outputPath, { recursive: true });
      fs.writeFileSync(`${outputPath}/${filename}`, content, { encoding: 'utf-8' });
    });
}

function fetchPage(apiKey, playlistId, pageToken) {
  return new Promise((resolve, reject) => {
    let url = `${YOUTUBE_URL}/youtube/v3/playlistItems?key=${apiKey}&part=snippet%2CcontentDetails&playlistId=${playlistId}&maxResults=50`;
    if (pageToken !== null) {
      url = `${url}&pageToken=${pageToken}`;
    }
    const options = {
      'method': 'GET',
      'url': url,
      'headers': {}
    };
    request(options, (error, response) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(response.body));
    });
  });
}

function template(str, item, thumbnailSize) {
  const thumbnail = item.snippet.thumbnails[thumbnailSize] || item.snippet.thumbnails['default'];
  return str
    .replace('${id}', item.id)
    .replace('${etag}', item.etag)
    .replace('${title}', clean(item.snippet.title))
    .replace('${description}', clean(item.snippet.description))
    .replace('${thumbnailUrl}', thumbnail.url)
    .replace('${channelId}', item.snippet.channelId)
    .replace('${channelTitle}', clean(item.snippet.channelTitle))
    .replace('${playlistId}', item.snippet.playlistId)
    .replace('${position}', item.snippet.position)
    .replace('${videoOwnerChannelTitle}', clean(item.snippet.videoOwnerChannelTitle))
    .replace('${videoOwnerChannelId}', item.snippet.videoOwnerChannelId)
    .replace('${videoId}', item.snippet.resourceId.videoId)
    .replace('${publishedAt}', item.snippet.publishedAt);
}

function clean(str) {
  return str
    .replaceAll('\n', '\\n')
    .replaceAll('\'', '\'\'')
    .replaceAll('"', '\\"');
}