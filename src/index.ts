#!/usr/bin/env node

import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import color from 'picocolors';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { EXPRESS_FACILITATOR, EXPRESS_MCP_SERVER, VERCEL_AI_AGENT } from './constants';

async function main() {
  console.clear();
  await setTimeout(1000);

  const args = process.argv.slice(2);
  const task = args[0];
  if (task !== "create") {
    console.log("Did you mean npx ai2wallet create ?");
    process.exit(0)
  }

  p.intro(`${color.bgBlueBright(color.black('Welcome to Ai2Wallet CLI'))}`);

  const name = await p.text({
    message: 'Where should we create your project ?',
    placeholder: './demo-project',
    validate: (value) => {
      if (!value?.startsWith("./")) return 'Project repository name must be prefixed with ./';
      if (!value || value.length < 3) return 'Project repository name must be at least 1 character';
      if (fs.existsSync(path.join(process.cwd(), value))) return 'This project repository already exists, choose another one !'
      return undefined;
    },
  });

  if (p.isCancel(name)) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  const agentframework = await p.select({
    message: 'Pick an agent framework',
    options: [
      { value: 'ai', label: 'Vercel AI SDK' },
      { value: 'mastra', label: 'Mastra', hint: 'coming soon', disabled: true },
      { value: 'eliza', label: 'ElizaOS', hint: 'coming soon', disabled: true },
      { value: 'openclaw', label: 'OpenClaw', hint: 'coming soon', disabled: true },
      { value: 'langchain', label: 'Langchain', hint: 'coming soon', disabled: true },
      { value: 'Cloudfare', label: 'Cloudflare Agents', hint: 'coming soon', disabled: true }
    ],
    maxItems: 10,
  });

  if (p.isCancel(agentframework)) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  const mcpServerFramework = await p.select({
    message: 'Choose MCP server framework',
    options: [
      { value: "express", label: "Express" },
      { value: "hono", label: "Hono", hint: 'coming soon', disabled: true }
    ]
  });

  if (p.isCancel(mcpServerFramework)) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  const selfHostFacilitator = await p.confirm({
    message: 'Do you want to self-host facilitator ?'
  });

  if (p.isCancel(selfHostFacilitator)) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  if (selfHostFacilitator) {
    const facilitatorFramework = await p.select({
      message: 'Choose facilitator server framework',
      options: [
        { value: "express", label: "Express" },
        { value: "hono", label: "Hono", hint: 'coming soon', disabled: true }
      ]
    });

    if (p.isCancel(facilitatorFramework)) {
      console.log('Operation cancelled');
      process.exit(0);
    }
  }

  const spin = p.spinner();
  spin.start('Creating project...');

  await p.tasks([
    {
      title: 'Create project repository',
      task: async () => {
        try {
          await setTimeout(1000);
          fs.mkdirSync(path.join(process.cwd(), name), { recursive: true });
        } catch (err) {
          console.error(err);

        }
        return 'Project repository successfully created !';
      },
    },
    {
      title: 'Creating AI Agent...',
      task: async () => {
        exec(`git clone ${VERCEL_AI_AGENT} ${name + "/agent"}`, (error, stdout, stderr) => {
          if (error) {

            console.error(`Error: ${error.message}`);
            return;
          }

        });
        return 'Your agent has been created successfully';
      },
    },
    {
      title: 'Setting MCP Server...',
      task: async () => {
        exec(`git clone -b ${"stellar"} ${EXPRESS_MCP_SERVER} ${name + "/server"}`, (error, stdout, stderr) => {
          if (error) {

            console.error(`Error: ${error.message}`);
            return;
          }

        });
        return 'Your MCP Server has been configured with success';
      },
    },
        {
      title: 'Setting Facilitator...',
      task: async () => {
        if(selfHostFacilitator){
        exec(`git clone -b ${"stellar"} ${EXPRESS_FACILITATOR} ${name + "/facilitator"}`, (error, stdout, stderr) => {
          if (error) {

            console.error(`Error: ${error.message}`);
            return;
          }
        });
          return 'Your Facilitator server is up';
        }else{
          return "You need to configure third party facilitator in your project"
        }
    
      },
    },
  ]);

  spin.stop('Congratulation 🎉 your project is ready. see README.md for further config and running !');
}

main().catch(console.error);