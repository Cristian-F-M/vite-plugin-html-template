import { type Cheerio, load } from 'cheerio'
import type { Element } from 'domhandler'
import type { Plugin } from 'vite'
import {
	DEFAULT_OPTIONS,
	toMergeWithComma,
	toMergeWithSpaces
} from '@/constants'
import type { HTMLTemplateOptions } from '@/types/html-template'
import {
	dataAttrToDatasetKey,
	mergeCommaSeparated,
	mergeSpaceSeparated,
	mergeStyle,
	mergeWithDefaults
} from '@/utils/'

export type { HTMLTemplateOptions } from '@/types/html-template'

export default function htmlTemplate(
	options: HTMLTemplateOptions = DEFAULT_OPTIONS
): Plugin {
	const mergedOptions = mergeWithDefaults(DEFAULT_OPTIONS, options)

	const { tag } = mergedOptions

	return {
		name: 'html-template',
		enforce: 'pre',
		transformIndexHtml(code) {
			const $ = load(code)
			const propsAdded: Set<string> = new Set()

			;($(tag) as Cheerio<Element>).each((_, t) => {
				const xTemplate = $(t)
				const attrs = t.attribs
				const dataset = dataAttrToDatasetKey(t.attributes)
				const templateId = attrs['data-template-id']

				if (!attrs || !templateId)
					throw new Error(
						`Each ${tag} must have a data-template-id attribute with template id`
					)

				const template = $(`template#${templateId}`).clone()

				if (!template?.length)
					throw new Error(
						`There is not template elemente with id ${templateId}\n (<template id="foo">...</template>)`
					)

				if (!template.contents().children().length) {
					throw new Error(
						`Template <template id="${templateId}"></template> does not have at least one child`
					)
				}

				for (const [_, attr] of Object.entries(dataset)) {
					const { name, rawName, value } = attr
					if (!rawName.startsWith('data-') || rawName === 'data-template-id')
						continue

					const camelKey = name
					const kebabKey = rawName.slice(5)

					const matchResult = (template.html() ?? '').matchAll(
						new RegExp(`{${camelKey}|{${kebabKey}`, 'g')
					)

					if (matchResult.toArray().length > 0) {
						propsAdded.add(rawName)
					}

					const templateHTML = template.html() ?? ''
					const newTemplateHTML = templateHTML.replaceAll(
						new RegExp(`{${camelKey}}|{${kebabKey}}`, 'g'),
						value
					)

					template.html(newTemplateHTML)
				}

				const templateChild = template.contents()

				const setAttributes = (attr: string, value: string) =>
					template.children().first().attr(attr, value)

				for (const [rawName, value] of Object.entries(attrs)) {
					if (propsAdded.has(rawName) || rawName === 'data-template-id')
						continue

					const prevAttrs = template.find('*').attr(rawName)

					if (toMergeWithSpaces.includes(rawName)) {
						setAttributes(rawName, mergeSpaceSeparated(prevAttrs, value))
						continue
					}

					if (toMergeWithComma.includes(rawName)) {
						setAttributes(rawName, mergeCommaSeparated(prevAttrs, value))
						continue
					}

					if (rawName === 'style') {
						const prevAttrs = template.contents().find('*').attr(rawName)
						template
							.contents()
							.find('*')
							.attr(rawName, mergeStyle(prevAttrs, value))
						continue
					}

					templateChild.attr(rawName, value)
				}

				if (template.html()?.includes('{children}')) {
					let htmlTemplate = template.html() ?? ''

					if (xTemplate.html()) {
						htmlTemplate = htmlTemplate.replaceAll(
							'{children}',
							// biome-ignore lint/style/noNonNullAssertion: It is inside a if block
							xTemplate.html()!
						)
					}
					template.html(htmlTemplate)
				}

				// biome-ignore lint/style/noNonNullAssertion: It is inside a if block
				if (template.html()) $(xTemplate).replaceWith(template.html()!)
			})

			return $.html()
		}
	}
}