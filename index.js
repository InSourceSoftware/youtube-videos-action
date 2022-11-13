const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');
const fs = require('fs');

const YOUTUBE_URL = 'https://youtube.googleapis.com';

main()

function main() {
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
    fetchVideos(apiKey, playlistId, thumbnailSize, outputPath, outputFilenameTemplate, outputContentTemplate);
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

function fetchVideos(apiKey, playlistId, thumbnailSize, outputPath, outputFilenameTemplate, outputContentTemplate) {
  const url = `${YOUTUBE_URL}/youtube/v3/playlistItems?key=${apiKey}&part=snippet%2CcontentDetails&playlistId=${playlistId}&maxResults=500`;
  const options = {
    'method': 'GET',
    'url': url,
    'headers': {}
  };
  request(options, (error, response) => {
    if (error) {
      throw new Error(error);
    }
    const data = JSON.parse(response.body);
    data.items
      .filter(item => Object.keys(item.snippet.thumbnails).length !== 0)
      .forEach(item => {
        const content = template(outputContentTemplate, item, thumbnailSize);
        const filename = template(outputFilenameTemplate, item, thumbnailSize);
        fs.mkdirSync(outputPath, { recursive: true });
        fs.writeFileSync(`${outputPath}/${filename}`, content, { encoding: 'utf-8' });
      });
  });
}


function template(str, item, thumbnailSize) {
  return str
    .replace('${id}', item.id)
    .replace('${etag}', item.etag)
    .replace('${title}', clean(item.snippet.title))
    .replace('${description}', clean(item.snippet.description))
    .replace('${thumbnailUrl}', item.snippet.thumbnails[thumbnailSize].url)
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
    .replace('\n', '\\n')
    .replace(/^\d{1,4}\.\d{1,4}\.\d{1,4}[ _.-]+/, '');
}