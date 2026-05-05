# @cmorales_/vite-plugin-html-template

`@cmorales_/vite-plugin-html-template` is a plugin for vite and mainly for 'Vanilla' (without specific framework, like React.js, Vue, Svelte, ...), with which you can define within the `<template>` tag as a component, then you can use the `<x-template>` tag (customizable) and also add HTML attributes (class, data-\*, style, aria-\*)


## Installation
1. Install the package from [npmjs](https://npmjs.com/package/@cmorales_/vite-plugin-html-template).
```bash
	bun add @cmorales_/vite-plugin-html-template
	# or npm install ... or pnpm add ... or yarn add ...
```
2. Import and add the plugin to the vite config.
```javascript
import { defineConfig } from 'vite'
import htmlTemplate from '@cmorales_/vite-plugin-html-template'

export default defineConfig({
	plugins: [/*...plugins */ htmlTemplate({...})],
	//...vite config

})
```


## Usage 
1. In your `HTML` define a `<template>` element with an unique id.
> [!WARNING]
> 1. The element `<template>` must have at least and at most *1* element.
> 2. The attributes should be added to the element within the `<template>` tag and not to the `<template>` element itself.
```html
   <!-- You should add attributes to the element within the <template> element -->
	 <template id="unique-id">
		<div class="..." ...other-attributes></div>
	 </template>
```
2. Use the template with the `<x-template>` tag.
> [!WARNING]
> You need add the `data-template-id` attribute to the `<x-template>` element referencing the same id as the `<template>` element to be used. 
```html
<x-template data-template-id="template-id"  class="..." style="..." ></x-template>
```
3. Complete and working example
```html

<!-- You can use it multiple times -->
<x-template data-template-id="primary-button-template" class="disabled-button" data-text="Press it"></x-template>
<x-template data-template-id="primary-button-template" data-text="Another button"></x-template>


<!-- You can add attributes to element within template element  -->
<template id="primary-button-template">
		<button class="primary-button" type="button">{text}</button>
</template>
```

4. The result will be like:
```html	
<button class="primary-button disabled-button" type="button">Press it</button>	
<button class="primary-button" type="button">Another button</button>
	
<template id="primary-button-template">
		<button class="primary-button" type="button">{text}</button>
</template>
```

## API

### Template placeholders

You can inject dynamic values into your templates using placeholders.

To define a placeholder, use curly braces inside the template:

```html
<template id="card">
  <div class="card">
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
</template>
```

Then, pass values using data-* attributes in `<x-template>`:

```html
<x-template 
  data-template-id="card"
  data-title="Hello world"
  data-description="This is a description"
></x-template>
```

Result

```html
<div class="card">
  <h2>Hello world</h2>
  <p>This is a description</p>
</div>
```


### Attribute merging

Attributes passed to `<x-template>` are merged into the root element of the template.

```html
<x-template 
  data-template-id="card"
  class="highlight"
  style="color:red;"
></x-template>
```

Result 

```html
<div class="card highlight" style="color:red;">
```


### Supported attributes

You can pass any valid HTML attribute:

- `class`
- `style`
- `data-*`
- `aria-*`
- `etc.`


> [!NOTE]
> - Placeholder names must match the data-* attributes without the data- prefix.
> - If a placeholder is not provided, it will remain unchanged.


## Plugin options
| Option | Type   | Description                                                                 | Default        |
| ------ | ------ | --------------------------------------------------------------------------- | -------------- |
| tag    | string | Custom tag name used to render template instances instead of `<x-template>` | `"x-template"` |

## About the Author

Created by **Cristian Morales**.

- **GitHub:** [Cristian-F-M](https://github.com/Cristian-F-M)
- **Twitter:** [@Morales_M20](https://x.com/Morales_M20)
- **Portfolio:** [cmorales.work](https://cmorales.work)

## Support

If you find this tool useful, you can support my work!

<a href="https://www.buymeacoffee.com/cmorales" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>