import 'dotenv/config';
import path from 'path';
import Fastify from 'fastify';
import fastifyAutoload from '@fastify/autoload';
import FastifyStatic from '@fastify/static';
import FastifyCors from '@fastify/cors';
import FastifyCookie from '@fastify/cookie';
import { sequelize } from './models/index.mjs';
import formDataPlugin from "@fastify/formbody";

const isProduction = process.env.NODE_ENV === 'production';

const fastify = Fastify({ });

fastify.register(FastifyCors, {
  credentials: true
});

fastify.register(formDataPlugin);


fastify.register(FastifyCookie, {
  secret: 'ignore', // we don't use cookie serialize/deserialize
  hook: 'onRequest',
  parseOptions: {}
});

fastify.decorate('sequelize', sequelize);

fastify.get('/login/github', async (request, reply) => reply.redirect(
  302,
  `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
));

async function getAccessToken(code) {
  let json = null;

  try {
    const response = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: ''
      }
    );

    json = await response.json();

  } catch (e) {
    console.error(e);
  }

  return json?.access_token || null;
}

async function getUserInfo(accessToken) {
  let json = null;

  try {
    const response2 = await fetch(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: 'token ' + accessToken
        }
      }
    );

    json = await response2.json();

  } catch (e) {
    console.error(e);
  }

  return json;
}

fastify.get('/login/github/callback', async (request, reply) => {
  const { code } = request.query;

  const accessToken = await getAccessToken(code);
  if (!accessToken) {
    reply.code(401);
    return "Unauthorized";
  }

  const userInfo = await getUserInfo(accessToken);

  if (!userInfo.id) {
    reply.code(401);
    return "Unauthorized (2)";
  }

  await fastify.sequelize.models.User.findOrCreate({
    where: {
      id: userInfo.id
    },
    defaults: {
      id: userInfo.id,
      email: userInfo.email
    }
  });

  reply
    .setCookie(process.env.SESSION_COOKIE_NAME, userInfo.id, { // FIXME naive
      path: '/',
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_EXPIRATION_SECONDS, 10)
    })
    .redirect(302, '/');
});

fastify.get('/login/logout', async (request, reply) => {
  reply
    .clearCookie(process.env.SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true
    })
    .redirect(302, '/');
});

if (isProduction) {
  const root = path.resolve(process.cwd(), path.dirname(process.argv[1]), '..', 'frontend-dist');
  fastify.register(FastifyStatic, {
    root
  });
}

fastify.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/api/')) {
    if (!request.cookies[process.env.SESSION_COOKIE_NAME]) {
      reply.status(401).send({ success: false, message: "Unauthorized" });
      return;
    }

    request.user = await sequelize.models.User.findByPk(request.cookies[process.env.SESSION_COOKIE_NAME]);
    if (!request.user) {
      reply.status(401).send({ success: false, message: "Unauthorized" });
      return;
    }
  }
});

fastify.register(fastifyAutoload, {
  dir: path.resolve('.', 'routes'),
  dirNameRoutePrefix: true,
  autoHooks: true,
  cascadeHooks: true
});

fastify.setErrorHandler(async (error, request, reply) => {
  console.error("Caught error:");
  console.error(error);
  // FIXME: catch sequelize errors here? Or we don't care?

  if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    reply.status(401);

    if (request.url.startsWith('/api/')) {
      reply.send({ success: false, message: "Unauthorized" });
    } else {
      reply.send('authorization failed');
    }

    return;
  }

  if (error.validation) {
    reply.status(422);

    if (request.url.startsWith('/api/')) {
      reply.send({ success: false, message: "Validation error" });
    } else {
      reply.send('validation failed');
    }

    return;
  }

  reply.status(500);

  if (request.url.startsWith('/api/')) {
    reply.send({ success: false, message: "Internal server error" });
  } else {
    reply.send('Internal server error');
  }
});

fastify.listen(
  {
    port: process.env.LISTEN_PORT,
    host: process.env.LISTEN_HOST
  },
  (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log(`server listening on ${address}`);

    if (process.send) {
      process.send('ready');
    }
  }
);

