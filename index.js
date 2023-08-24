const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const nodeHtmlToImage = require('node-html-to-image');
const afterSpecFiles = [];

/**
 *
 * @param {*} file - HTML file
 * @param {*} customStart - for working with after:spec function
 */
async function convertHTMLFileToPNG(file, customStart = '') {
  const content = fs.readFileSync(
      file,
      'utf-8',
  );
  const newPath = `${file.substring(0, file.length - 5)}${customStart}.png`;

  await nodeHtmlToImage({
    output: newPath,
    html: content,
  })
      .then(() => console.log('The image was created successfully!'));

  return newPath;
}

/**
 *
 * @param {*} files - HTML files
 */
async function formatFiles(files) {
  const formattedFiles = [];
  for (let i = 0; i < files.length; i++) {
    const newPath = await convertHTMLFileToPNG(files[i]);
    formattedFiles.push(newPath);
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

/**
 *
 * @param {*} file - HTML file for converting to PNG
 */
async function afterSpecFunction(file) {
  const customStart = `-${afterSpecFiles.length}`;
  const newPath = await convertHTMLFileToPNG(file, customStart);
  afterSpecFiles.push(newPath);
}

/**
 *
 * @param {*} webhookUrl - Webhook URL from Discord
 * @param {*} content - text for message in Discord
 * @param {*} username - username for Bot in Discord
 * @param {*} avatarUrl - URL for image for Bot's avatar in Discord
 */
async function sendToDiscordWebhookForEachSpec(webhookUrl,
    content = undefined,
    username = undefined,
    avatarUrl = undefined,
) {
  for (let i = 0; i < afterSpecFiles.length; i += 10) {
    const data = new FormData();

    const sliceArray = afterSpecFiles.slice(i, i + 9);

    sliceArray.forEach((file, index) => {
      data.append(`files[${index}]`, fs.createReadStream(file));
    });

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
  }
};

module.exports = {
  sendToDiscordWebhook,
  afterSpecFunction,
  sendToDiscordWebhookForEachSpec,
};
