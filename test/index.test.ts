/// <reference types="../types/vitest.d.ts" />

import { createServer, type ViteDevServer } from 'vite'
import { describe, expect, it } from 'vitest'
import htmlTemplate from '../index'
import type { HTMLTemplateOptions } from '../types/html-template'

async function runOnViteServer(
	fn: (server: ViteDevServer) => Promise<unknown> | unknown,
	pluginOptions?: HTMLTemplateOptions
) {
	const server = await createServer({
		configFile: false,
		plugins: [htmlTemplate(pluginOptions)]
	})

	const result = await fn(server)

	await server.close()

	return result
}

describe('HTML template vite plugin', () => {
	it('It must be fails if there is not data-template-id', async () => {
		const html = `
		<x-template></x-template>
		`

		await runOnViteServer(async (server) => {
			await expect(server.transformIndexHtml('/', html)).rejects.toThrow()
		})
	})

	it('It must be fails if there is not template element with id=`data-template-id`', async () => {
		const html = `
		<x-template data-template-id="foo"></x-template> 
		<template>
			<div></div>
		</template>
		`

		await runOnViteServer(async (server) => {
			await expect(server.transformIndexHtml('/', html)).rejects.toThrow()
		})
	})

	it('It must be fails if template does not have at least a child', async () => {
		const html = `
		<x-template data-template-id="foo"></x-template> 
		<template id="foo"></template>
		`

		await runOnViteServer(async (server) => {
			await expect(server.transformIndexHtml('/', html)).rejects.toThrow()
		})
	})

	it('Replace a simple template', async () => {
		const html = `
		<x-template data-template-id="foo"></x-template> 
		<template id="foo">
			<span></span>
		</template>
		`

		const output = await runOnViteServer(async (server) => {
			return await server.transformIndexHtml('/', html)
		})

		expect(output).toContainHTML(`
			<span></span>
			<template id="foo">
				<span></span>
			</template>
`)
	})

	it('Replace placeholder {variable} with data-* from x-template [basic-keys] {variable}', async () => {
		const html = `
		<x-template data-template-id="foo" data-title="Title" data-description="Description" ></x-template> 
		<template id="foo">
			<div>
				<h1>{title}</h1>
				<p>{description}</p>
			</div>
		</template>
		`

		const output = await runOnViteServer(async (server) => {
			return await server.transformIndexHtml('/', html)
		})

		expect(output).toContainHTML(`
		<div>
			<h1>Title</h1>
			<p>Description</p>
		</div>
		<template id="foo">
			<div>
				<h1>{title}</h1>
				<p>{description}</p>
			</div>
		</template>
`)
	})

	it('Replace placeholder {variable} with data-* from x-template [camelcase-keys] {variableName}', async () => {
		const html = `
		<x-template data-template-id="foo" data-main-title="Main title" data-sub-title="Subtitle" data-description="Description"></x-template> 
		<template id="foo">
			<div>
				<h1>{mainTitle}</h1>
				<h5>{subTitle}</h5>
				<p>{description}</p>
			</div>
		</template>
		`

		const output = await runOnViteServer(async (server) => {
			return await server.transformIndexHtml('/', html)
		})

		expect(output).toContainHTML(`
		<div>
			<h1>Main title</h1>
			<h5>Subtitle</h5>
			<p>Description</p>
		</div>
		<template id="foo">
			<div>
				<h1>{mainTitle}</h1>
				<h5>{subTitle}</h5>
				<p>{description}</p>
			</div>
		</template>
`)
	})

	it('Replace placeholder {variable} with data-* from x-template [kebabcase-keys] {variable-name}', async () => {
		const html = `
		<x-template data-template-id="foo" data-main-title="Main title" data-sub-title="Subtitle" data-description="Description"></x-template> 
		<template id="foo">
			<div>
				<h1>{main-title}</h1>
				<h5>{sub-title}</h5>
				<p>{description}</p>
			</div>
		</template>
		`

		const output = await runOnViteServer(async (server) => {
			return await server.transformIndexHtml('/', html)
		})

		expect(output).toContainHTML(`
		<div>
			<h1>Main title</h1>
			<h5>Subtitle</h5>
			<p>Description</p>
		</div>


		<template id="foo">
			<div>
				<h1>{main-title}</h1>
				<h5>{sub-title}</h5>
				<p>{description}</p>
			</div>
		</template>
`)
	})

	it('Add class attribute from x-template to template child and merge them if x-template already has class attribute', async () => {
		const html = `
	<x-template data-template-id="primary-button-template" class="disabled-button" data-text="Press it"></x-template>
	<x-template data-template-id="primary-button-template" data-text="Another button"></x-template>

	<template id="primary-button-template">
		<button class="primary-button" type="button">{text}</button>
	</template>
		`

		const output = await runOnViteServer(async (server) => {
			return await server.transformIndexHtml('/', html)
		})

		expect(output).toContainHTML(`
			<button class="primary-button disabled-button" type="button">Press it</button>
			<button class="primary-button" type="button">Another button</button>
				
			<template id="primary-button-template">
				<button class="primary-button" type="button">{text}</button>
			</template>
`)
	})

	it('Add style attribute from x-template to template child and merge them if x-template already has style attribute', async () => {
		const html = `
	<x-template data-template-id="foo" style="background: black; font-size: 20px;"></x-template> 
	<template id="foo">
		<div style="background: #555; color: black;"></div>
	</template>`

		const output = await runOnViteServer(async (server) => {
			return await server.transformIndexHtml('/', html)
		})

		expect(output).toContainHTML(`
		<div style="background: black; color: black; font-size: 20px;"></div>

		<template id="foo">
			<div style="background: #555; color: black;">
			</div>
		</template>
`)
	})

	it('Add attributes to template child from x-template element', async () => {
		const html = `
		<x-template data-template-id="foo" data-foo="bar"></x-template> 
		<template id="foo">
			<div></div>
		</template>
		`

		const output = await runOnViteServer(async (server) => {
			return await server.transformIndexHtml('/', html)
		})

		expect(output).toContainHTML(`
		<div data-foo="bar"></div>

		<template id="foo">
			<div></div>
		</template>
`)
	})

	it('Replace a simple template [changging tag to <x-component>]', async () => {
		const html = `
		<x-component data-template-id="foo"></x-component> 
		<template id="foo">
			<span></span>
		</template>
		`

		const output = await runOnViteServer(
			async (server) => {
				return await server.transformIndexHtml('/', html)
			},
			{ tag: 'x-component' }
		)

		expect(output).toContainHTML(`
			<span></span>
			<template id="foo">
				<span></span>
			</template>
`)
	})
})