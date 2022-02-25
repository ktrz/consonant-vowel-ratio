import { getInput } from '@actions/core'
import { context } from '@actions/github'
import { GithubContext } from './types';

function greeting(name: string, repoUrl: string) {
  console.log(`Hello ${name}! You are running a GitHub action in ${repoUrl}`)
}

const inputName = getInput('name')

const getRepoUrl = ({ repo, serverUrl }: GithubContext): string => {
  return `${serverUrl}/${repo.owner}/${repo.repo}`
}

greeting(inputName, getRepoUrl(context))

console.log("--- Payload ---")
console.log(JSON.stringify(context.payload))
console.log("---------------")
