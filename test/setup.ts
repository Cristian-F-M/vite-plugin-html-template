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

		const receivedCleaned = cleanHTML(received)
		const expectedCleaned = cleanHTML(expected)

		const pass = receivedCleaned.includes(expectedCleaned)

		if (pass) return { message: () => ``, pass: true }

		return {
			message: () => `Received HTML does not contains expected HTML`,
			pass: false,
			expected: expectedCleaned,
			actual: receivedCleaned
		}
	}
})