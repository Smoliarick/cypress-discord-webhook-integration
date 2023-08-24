const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');

/**
 *
 * @param {*} files - HTML files
 */
async function formatFiles(files) {
  const formattedFiles = [];
  for (let i = 0; i < files.length; i++) {
    const content = fs.readFileSync(
        files[i],
        'utf-8',
    );
    const newPath = `${files[i].substring(0, files[i].length - 4)}png`;
    formattedFiles.push(newPath);

    await nodeHtmlToImage({
      output: newPath,
      html: content,
    })
        .then(() => console.log('The image was created successfully!'));
  }
  return formattedFiles;
}

/**
 *
 * @param {*} webhookUrl - Webhook URL from Discord
 * @param {*} files - the list of files,
 *  example: ['index.html', './cypress/report/index.html']
 * @param {*} content - text for message in Discord
 * @param {*} username - username for Bot in Discord
 * @param {*} avatarUrl - URL for image for Bot's avatar in Discord
 * @param {*} convertHtmlToPng - bool flag for converting html files to png
 */
async function sendToDiscordWebhook(webhookUrl,
    files,
    content = undefined,
    username = undefined,
    avatarUrl = undefined,
    convertHtmlToPng = false,
) {
  const data = new FormData();

  if (convertHtmlToPng) {
    const formattedFiles = await formatFiles(files);
    formattedFiles.forEach((file, index) => {
      data.append(`files[${index}]`, fs.createReadStream(file));
    });
  } else {
    files.forEach((file, index) => {
      data.append(`files[${index}]`, fs.createReadStream(file));
    });
  }

  const nowDate = new Date();
  const userContent = content ? content :
    `Report from Cypress:\nDate: ${nowDate.toLocaleString()}`;
  const userUsername = username ? username : 'Cypress Autotest Report';
  const userAvatarUrl = avatarUrl ? avatarUrl : 'https://avatars.githubusercontent.com/u/8908513?s=200&v=4';

  data.append('content', userContent);
  data.append('username', userUsername);
  data.append('avatar_url', userAvatarUrl);

  const config = {
    method: 'post',
    url: webhookUrl,
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  await axios(config).catch((error) => {
    console.log(error);
  });
};

module.exports = sendToDiscordWebhook;
