export default async function routes(instance) {
  instance.get(
    '/',

    async request => {
      const user = await instance.sequelize.models.User.findByPk(request.user.id);

      return { success: true, secret: user.secret };
    }
  );

  instance.get(
    '/regenerate/',

    async request => {
      const secret = instance.sequelize.models.User.generateSecret()

      let result;
      try {
        result = await instance.sequelize.models.User.update(
          {
            secret
          },
          {
            where: {
              id: request.user.id
            }
          }
        );
      } catch (error) {
        console.log(error);
      }

      if (result[0] === 0) {
        return { success: false, message: "Failed to regenerate secret" };
      }

      return { success: true, secret };
    }
  );
}
