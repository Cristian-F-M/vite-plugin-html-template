import { type HTMLElement, parse } from 'node-html-parser'
import type { Plugin } from 'vite'
import {
	DEFAULT_OPTIONS,
	toMergeWithComma,
	toMergeWithSpaces
} from '@/constants'
import type { HTMLTemplateOptions } from '@/types/html-template'
import {
	kebabcaseToCamecase,
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
			const root = parse(code)
			const xTemplates = root.querySelectorAll(tag)

			for (const xTemplate of xTemplates) {
				const { attributes } = xTemplate
				const templateId = attributes['data-template-id']

				const templates = root.querySelectorAll(`template#${templateId}`)

				if (!templateId) {
					throw new Error(
						`Each ${tag} element must have a data-template-id attribute with template id`
					)
				}

				if (!templates.length)
					throw new Error(
						`There is not template element with id ${templateId}\n (<template id="foo">...</template>)`
					)

				if (templates.length > 1) {
					throw new Error(
						`There are ${templates.length} template elements with the same id (${templateId})\nEnsure you have each template element with an unique id`
					)
				}

				// biome-ignore lint/style/noNonNullAssertion: It is after two conditions
				const template = templates.at(0)!.clone() as HTMLElement
				// biome-ignore lint/style/noNonNullAssertion: It is after conditions
				const child = template.children[0]!

				if (!template.children.length) {
					throw new Error(
						`Template <template id="${templateId}"></template> does not have at least one child`
					)
				}

				if (template.children.length > 1) {
					throw new Error(
						`Template <template id="${templateId}"></template> must have at most one child.`
					)
				}

				for (const [rawName, value] of Object.entries(attributes)) {
					if (rawName === 'data-template-id') continue

					const prevAttr = child.getAttribute(rawName)
					let newAttr: string | null = null

					if (toMergeWithSpaces.includes(rawName))
						newAttr = mergeSpaceSeparated(prevAttr, value)

					if (toMergeWithComma.includes(rawName))
						newAttr = mergeCommaSeparated(prevAttr, value)

					if (rawName === 'style') newAttr = mergeStyle(prevAttr, value)

					if (newAttr) {
						child.setAttribute(rawName, newAttr)
						continue
					}

					const kebabName = rawName.slice('data-'.length)

					const rString = [rawName, kebabName]
						.flatMap((name) => [name, kebabcaseToCamecase(name)])
						.map((name) => `{${name}}`)
						.join('|')

					const placeholderRegex = new RegExp(rString, 'g')

					const matchResult = template.innerHTML.matchAll(placeholderRegex)
					const areTherePlaceholders = matchResult.toArray().length > 0

					if (areTherePlaceholders) {
						template.innerHTML = template.innerHTML.replaceAll(
							placeholderRegex,
							value
						)
						continue
					}

					child.setAttribute(rawName, value)
				}

				const childrenRegex = /{children}/g

				template.innerHTML = template.innerHTML.replaceAll(
					childrenRegex,
					xTemplate.children.map((child) => child.outerHTML).join(' ')
				)

				xTemplate.replaceWith(template.innerHTML)
			}

			return root.outerHTML
		}
	}
}