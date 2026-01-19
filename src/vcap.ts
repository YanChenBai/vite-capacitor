#!/usr/bin/env node

import { execSync } from 'node:child_process'
import process from 'node:process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { updateConfig } from '.'

yargs(hideBin(process.argv))
  .command(
    'sync [platform]',
    'This command runs copy and then update.',
    (yargs) => {
      return yargs
        .positional('platform', {
          choices: ['android', 'ios'],
          description: 'android, ios',
        })
        .option('deployment', {
          type: 'boolean',
          description: `Podfile.lock won't be deleted and pod install will use --deployment option.`,
          default: false,
        })
        .option('inline', {
          type: 'boolean',
          description: `After syncing, all JS source maps will be inlined allowing for debugging an Android Web View in Chromium based browsers.`,
          default: false,
        })
        .option('build', {
          type: 'boolean',
          description: 'Toggle between development and production configuration.',
          default: false,
        })
    },
    async (argv) => {
      const { platform, deployment, inline, build } = argv

      await updateConfig(build)

      try {
        const envPrefix = process.platform === 'win32'
          ? `set NODE_ENV=${build ? 'production' : 'development'} && `
          : `NODE_ENV=${build ? 'production' : 'development'} `

        execSync(
          [envPrefix, 'npx', 'cap', 'sync', platform ?? '', deployment ? '--deployment' : '', inline ? '--inline' : ''].join(' '),
          {
            stdio: 'inherit',
            env: { ...process.env },
            cwd: process.cwd(),
          },
        )
      }
      catch {
        process.exit(1)
      }
    },
  )
  .demandCommand(1)
  .help()
  .alias('h', 'help')
  .parse()
