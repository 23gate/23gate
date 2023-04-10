import SuperTokens from 'supertokens-web-js';
import EmailPasswordReact from 'supertokens-auth-react/recipe/emailpassword';
import SessionReact from 'supertokens-auth-react/recipe/session';
import Session from 'supertokens-web-js/recipe/session';

export const SuperTokensReactConfig = {
  appInfo: {
    appName: import.meta.env.VITE_SUPERTOKENS_APPNAME,
    apiDomain: import.meta.env.VITE_SUPERTOKENS_APIDOMAIN,
    websiteDomain: import.meta.env.VITE_SUPERTOKENS_WEBSITEDOMAIN,
    apiBasePath: '/auth',
    websiteBasePath: '/a'
  },
  recipeList: [
    EmailPasswordReact.init({
      useShadowDom: false
    }),
    SessionReact.init()
  ]
};

export const SuperTokensWebJSConfig = {
  appInfo: {
    appName: import.meta.env.VITE_SUPERTOKENS_APPNAME,
    apiDomain: import.meta.env.VITE_SUPERTOKENS_APIDOMAIN
  },
  recipeList: [
    Session.init()
  ]
};

SuperTokens.init(SuperTokensWebJSConfig);
