export default async function routes(instance) {
  instance.get(
    '/',

    async () => {
      const chain = await instance.sequelize.models.Chain.findAll({
        order: [ [ 'chainId', 'asc' ] ],
        raw: true
      });

      return {
        success: true,
        chain
      };
    }
  );
}
