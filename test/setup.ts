import { expect } from 'vitest'

expect.extend({
	toContainHTML(received, expected) {
		function cleanHTML(html: string) {
			return html
				.replace(/<head>[\s\S]*?<\/head>/gi, '')
				.replace(/<script[\s\S]*?<\/script>/gi, '')
				.replace(/\s+/g, ' ')
				.replace(/>\s+</g, '><')
				.trim()
		}

		const pass = cleanHTML(received).includes(cleanHTML(expected))

		if (pass) return { message: () => ``, pass: true }

		return {
			message: () => `Received HTML does not contains expected HTML`,
			pass: false,
			expected: expected,
			actual: received
		}
	}
})