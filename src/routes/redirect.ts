import { FastifyPluginAsync } from 'fastify'
import { NotFoundError } from '../errors/notFound.js'

export const redirectRoutes: FastifyPluginAsync = async function (fastify) {
	const parsedUrl = new URL(fastify.config.baseRedirectUrl)

	const url = `${parsedUrl.pathname}:id`
	/* Retrieve URL from store by id and redirect to it */
	fastify.route<{ Params: { id: string } }>({
		method: 'GET',
		url,
		handler: async function (request, reply) {
			if (request.validationError) throw new NotFoundError()
			this.storage.url.incVisitCount(request.params.id)
			const withInfo = await this.auth.isAuthorized(request)
			const storedUrl = await this.storage.url.get(request.params.id, { withInfo })
			if (typeof storedUrl.url === 'undefined') throw new NotFoundError()

			reply.redirect(storedUrl.url)
		},
		attachValidation: true,
		schema: {
			params: {
				type: 'object',
				required: ['id'],
				properties: {
					id: { type: 'string' },
				},
			},
		},
	})
}
