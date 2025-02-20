import fastifyPlugin from 'fastify-plugin';
import { Symbolicator } from "./Symbolicator.js";
async function symbolicatePlugin(instance, {
  delegate
}) {
  const symbolicator = new Symbolicator(delegate.symbolicator);
  instance.post('/symbolicate', async (request, reply) => {
    // React Native sends stack as JSON but tests content-type to text/plain, so
    // we cannot use JSON schema to validate the body.

    try {
      const {
        stack
      } = JSON.parse(request.body);
      const platform = Symbolicator.inferPlatformFromStack(stack);
      if (!platform) {
        request.log.debug({
          msg: 'Received stack',
          stack
        });
        reply.badRequest('Cannot infer platform from stack trace');
      } else {
        request.log.debug({
          msg: 'Starting symbolication',
          platform,
          stack
        });
        const results = await symbolicator.process(request.log, stack);
        reply.send(results);
      }
    } catch (error) {
      request.log.error({
        msg: 'Failed to symbolicate',
        error: error.message
      });
      reply.internalServerError();
    }
  });
}
export default fastifyPlugin(symbolicatePlugin, {
  name: 'symbolicate-plugin',
  dependencies: ['@fastify/sensible']
});
//# sourceMappingURL=sybmolicatePlugin.js.map