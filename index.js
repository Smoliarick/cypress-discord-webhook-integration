const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const data = new FormData();

/**
 *
 * @param {*} webhookUrl - Webhook URL from Discord
 * @param {*} files - the list of files,
 *  example: ['index.html', './cypress/report/index.html']
 * @param {*} content - text for message in Discord
 * @param {*} username - username for Bot in Discord
 * @param {*} avatarUrl - URL for image for Bot's avatar in Discord
 */
const sendToDiscordWebhook = (webhookUrl,
    files,
    content = undefined,
    username = undefined,
    avatarUrl = undefined,
) => {
  files.forEach((file, index) => {
    data.append(`files[${index}]`, fs.createReadStream(file));
  });

  const userContent = content ? content :
    'This message contains reports for Cypress Autotest';
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

  axios(config).then((response) => {
    console.log(JSON.stringify(response.data));
  }).catch((error) => {
    console.log(error);
  });
};

module.exports = sendToDiscordWebhook;
