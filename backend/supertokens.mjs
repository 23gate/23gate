import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session/index.js';
import EmailPassword from 'supertokens-node/recipe/emailpassword/index.js';

supertokens.init({
  framework: 'fastify',
  supertokens: {
    connectionURI: process.env.SUPERTOKENS_CONNECTIONURI,
    apiKey: process.env.SUPERTOKENS_APIKEY
  },
  appInfo: {
    appName: process.env.SUPERTOKENS_APPNAME,
    apiDomain: process.env.SUPERTOKENS_APIDOMAIN,
    websiteDomain: process.env.SUPERTOKENS_WEBSITEDOMAIN,
    apiBasePath: '/auth',
    websiteBasePath: '/a'
  },
  recipeList: [
    EmailPassword.init(),
    Session.init()
  ]
});

export default supertokens;
