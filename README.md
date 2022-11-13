# YouTube Videos Action

Fetch YouTube videos from a YouTube channel (by channel id) and create files or
posts on a website.

## Inputs

### `api-key`

**Required** Google api key with access to YouTube Data API v3

### `playlist-id`

**Required** YouTube playlist id

### `thumbnail-size`

**Optional** Thumbnail image size name, one of default, medium, high, standard,
maxres

### `output-path`

**Optional** Path to write output files to, defaults to `_data/videos`

### `output-filename-template`

**Optional** Output filename template for each output file including
placeholders, defaults to `${position}.yml`

### `output-content-template`

**Optional** Output content template for each output file including
placeholders[1], defaults to:

```
_id: '${id}'
etag: '${etag}'
title: '${title}'
description: '${description}'
thumbnailUrl: '${thumbnailUrl}'
channelId: '${channelId}'
channelTitle: '${channelTitle}'
playlistId: '${playlistId}'
position: ${position}
videoOwnerChannelTitle: '${videoOwnerChannelTitle}'
videoOwnerChannelId: '${videoOwnerChannelId}'
videoId: '${videoId}'
publishedAt: '${publishedAt}'
```

[1]: Placeholders currently include the following fields from the YouTube
playlist response:

* `${_id}`
* `${etag}`
* `${title}`
* `${description}`
* `${thumbnailUrl}`
* `${channelId}`
* `${channelTitle}`
* `${playlistId}`
* `${position}`
* `${videoOwnerChannelTitle}`
* `${videoOwnerChannelId}`
* `${videoId}`
* `${publishedAt}`

## Example usage

```yaml
uses: InSourceSoftware/youtube-videos-action@v1
with:
  api-key: ${{ secrets.GOOGLE_API_KEY }}
  playlist-id: 'xyz'
  thumbnail-size: 'standard'
  output-path: '_data/videos'
  output-filename-template: '${position}.yml'
  output-content-template: |
    _id: '${id}'
    etag: '${etag}'
    title: '${title}'
    description: '${description}'
    thumbnailUrl: '${thumbnailUrl}'
    channelId: '${channelId}'
    channelTitle: '${channelTitle}'
    playlistId: '${playlistId}'
    position: '${position}'
    videoOwnerChannelTitle: '${videoOwnerChannelTitle}'
    videoOwnerChannelId: '${videoOwnerChannelId}'
    videoId: '${videoId}'
    publishedAt: '${publishedAt}'
```