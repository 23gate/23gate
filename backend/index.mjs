import 'dotenv/config';
import path from 'path';
import Fastify from 'fastify';
import fastifyAutoload from '@fastify/autoload';
import FastifyStatic from '@fastify/static';
import FastifyCors from '@fastify/cors';
import { sequelize } from './models/index.mjs';
import supertokens from "./supertokens.mjs";
import { plugin } from "supertokens-node/framework/fastify/index.js";
import formDataPlugin from "@fastify/formbody";
import { verifySession } from "supertokens-node/recipe/session/framework/fastify/index.js";
import EmailPassword from 'supertokens-node/recipe/emailpassword/index.js';

const isProduction = process.env.NODE_ENV === 'production';

const logger = isProduction ? undefined : {
  transport: {
    target: '@fastify/one-line-logger'
  }
};

const fastify = Fastify({
  logger
});

fastify.register(FastifyCors, {
  origin: process.env.SUPERTOKENS_WEBSITEDOMAIN,
  allowedHeaders: ['Content-Type', ...supertokens.getAllCORSHeaders()],
  credentials: true
});

fastify.register(formDataPlugin);
fastify.register(plugin);

fastify.decorate('sequelize', sequelize);

if (process.env.NODE_ENV == 'production') {
  const root = path.resolve(process.cwd(), path.dirname(process.argv[1]), '..', 'frontend-dist');
  fastify.register(FastifyStatic, {
    root
  });
}

fastify.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/api/')) {
    try {
      await verifySession()(request, reply);
    } catch (err) {
      console.log('Supertokens VerifySession error:', err);
    }

    const userId = request?.session?.getUserId ? request.session.getUserId() : null;
    if (!userId) {
      reply.status(401).send({ success: false, message: "Unauthorized" });
      return;
    }

    request.user = await fastify.sequelize.models.User.findOne({ where: { uuid: userId } }, { raw: true });
    if (!request.user) {
      const userInfo = await EmailPassword.getUserById(userId);

      request.user = (await fastify.sequelize.models.User.create({
        uuid: userId,
        email: userInfo.email
      })).get({ plain:true });
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

