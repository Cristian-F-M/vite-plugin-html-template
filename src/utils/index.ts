import type { Element } from 'domhandler'

export function dataAttrToDatasetKey(attrs: Element['attributes']) {
	const rawAttributes = attrs.map((attr) => {
		if (!attr.name.startsWith('data-')) return null

		const newName = attr.name
			.slice(5)
			.split('-')
			.map((part, index) => {
				if (index === 0) return part
				return part.charAt(0).toUpperCase() + part.slice(1)
			})
			.join('')

		return [attr.name, { ...attr, name: newName, rawName: attr.name }]
	})

	const attributes = rawAttributes.filter((arr) => !!arr && !!arr[1]) as [
		string,
		unknown
	][]

	return Object.fromEntries(attributes) as Record<
		string,
		{
			name: string
			rawName: string
			value: string
			namespace?: string
			prefix?: string
		}
	>
}

export function mergeSpaceSeparated(...attrs: (string | undefined)[]) {
	const set = new Set(attrs.map((a) => a?.split(/\s+/).filter(Boolean)).flat())
	return [...set].join(' ')
}

export function mergeCommaSeparated(...attrs: (string | undefined)[]) {
	const attributes = attrs.map((a) => {
		return a
			?.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	})
	const set = new Set(attributes)
	return [...set].join(', ')
}

export function mergeClasses(...classes: (string | undefined)[]): string {
	return (
		classes
			.filter(Boolean)
			// biome-ignore lint/style/noNonNullAssertion: It is after a filter process
			.flatMap((c) => c!.trim().split(/\s+/))
			.filter((c, i, arr) => arr.indexOf(c) === i)
			.join(' ')
	)
}

export function mergeStyle(...styles: (string | undefined)[]) {
	const parse = (str?: string) =>
		(str?.split(';') ?? [])
			.map((s) => s.trim())
			.filter(Boolean)
			.map((rule) => rule.split(':').map((x) => x.trim()))

	const entries = styles.flatMap(parse) as [string, string][]

	return `${Array.from(new Map(entries))
		.map(([k, v]) => `${k}: ${v}`)
		.join('; ')};`
}

export function mergeWithDefaults<T extends Record<string, unknown>>(
	defaults: T,
	user: Partial<T> = {}
): T {
	const result = {} as T
	for (const key of Object.keys(defaults) as (keyof T)[]) {
		const userValue = user[key]
		result[key] = userValue ?? defaults[key]
	}
	return result
}