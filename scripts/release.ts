import { execSync } from 'node:child_process'

const args = process.argv

let versionType = 'patch'

if (args.includes('--major')) versionType = 'major'
if (args.includes('--minor')) versionType = 'minor'

try {
	console.log('🧪 Running tests...')
	execSync('npm run test -- run', { stdio: 'inherit' })

	console.log('🏗️ Building project...')
	execSync('npm run build', { stdio: 'inherit' })

	execSync('npm whoami', { stdio: 'inherit' })

	console.log(`📦 Bumping version (${versionType})...`)
	execSync(`npm version ${versionType}`, { stdio: 'inherit' })

	console.log('🚀 Publishing...')
	execSync('npm publish', { stdio: 'inherit' })
} catch (err) {
	console.error(`❌ Release failed\n${err}`)
	process.exit(1)
}