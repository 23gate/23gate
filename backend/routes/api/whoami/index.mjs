export default async function routes(instance) {
  instance.get(
    '/',

    async request => {
      let isFailedWebhook = null;

      if (request.user) {
        isFailedWebhook = await instance.sequelize.models.Webhook.isFailedWebhooksPresentByUserId(request.user.id);
      }

      return {
        success: true,
        email: request.user.email,
        isFailedWebhook
      };
    }
  );
}
