import { html } from 'js-beautify'
import { expect } from 'vitest'

function formatHtml(h: string) {
	return html(h, {
		indent_size: 2,
		preserve_newlines: false
	})
}

expect.extend({
	toContainHTML(received: string, expected: string) {
		function cleanHTML(html: string) {
			return html
				.replace(/<head>[\s\S]*?<\/head>/gi, '')
				.replace(/<script[\s\S]*?<\/script>/gi, '')
				.replace(/\s+/g, '')
				.replace(/>\s+</g, '><')
				.trim()
		}

		const receivedCleaned = cleanHTML(received)
		const expectedCleaned = cleanHTML(expected)

		const pass = receivedCleaned.includes(expectedCleaned)

		if (pass) {
			return {
				message: () =>
					`Expected received HTML not to contain:\n${formatHtml(expectedCleaned)}`,
				pass: true
			}
		}

		return {
			message: () => `Expected received HTML to contain expected HTML`,
			pass: false,
			expected: expectedCleaned,
			actual: receivedCleaned
		}
	}
})