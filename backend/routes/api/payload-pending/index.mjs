export default async function routes(instance) {
  instance.get(
    '/:id(^\\d+)/',

    async request => {
      const webhook = await instance.sequelize.models.Webhook.findByIdAndUserId(request.params.id, request.user.id);
      if (!webhook) {
        return { success: false, message: "Webhook not found" };
      }

      const result = await instance.sequelize.models.Payload.findAndCountAll({
        where: {
          webhookId: webhook.id
        },
        limit: 11,
        raw: true,
        order: [ [ 'id', 'DESC' ] ]
      });

      return { success: true, ...result };
    }
  );

  instance.delete(
    '/:id(^\\d+)/',

    async request => {
      try {
        await instance.sequelize.models.Payload.destroy({
          where: {
            webhookId: request.params.id,
            userId: request.user.id
          }
        });
      } catch (error) {
        console.log(error);
      }

      return { success: true };
    }
  );
}
