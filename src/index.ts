import { getInput } from '@actions/core'
import { context } from '@actions/github'

function greeting(name: string, repo: string) {
  console.log(`Hello ${name}! You are running a GitHub action in ${repo}`)
}

const inputName = getInput('name')

greeting(inputName, context.repo.repo)
