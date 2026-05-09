import { execSync } from 'node:child_process'
import pc from 'picocolors'

const args = process.argv

let versionType = 'patch'

const section = (title: string) => {
	console.log(
		`\n\n${pc.gray('────────────────────────────────────────')}\n` +
			`${pc.bold(pc.cyan(`🚀 ${title}`))}\n` +
			`${pc.gray('────────────────────────────────────────')}`
	)
}

if (args.includes('--major')) versionType = 'major'
if (args.includes('--minor')) versionType = 'minor'

try {
	section('Running tests')
	execSync('npm run test -- run', { stdio: 'inherit' })

	section('Building project')
	execSync('npm run build', { stdio: 'inherit' })

	section('Checking npm session')
	execSync('npm whoami', { stdio: 'inherit' })

	section(`Bumping version (${versionType})`)
	execSync(`npm version ${versionType}`, { stdio: 'inherit' })

	section('Publishing package')
	execSync('npm publish', { stdio: 'inherit' })

	console.log(`\n${pc.green('✅ Publish completed successfully!')}\n`)
} catch (err) {
	console.error(`❌ Release failed\n${err}`)
	process.exit(1)
}