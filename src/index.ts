import { getInput } from '@actions/core';
import { context } from '@actions/github';
import { GithubContext } from './types';
import { GitHub } from '@actions/github/lib/utils';

function greeting(name: string, repoUrl: string) {
  console.log(`Hello ${name}! You are running a GitHub action in ${repoUrl}`);
}

const inputName = getInput('name');

const getRepoUrl = ({ repo, serverUrl }: GithubContext): string => {
  return `${serverUrl}/${repo.owner}/${repo.repo}`;
};

greeting(inputName, getRepoUrl(context));

console.log('--- Action Info ---');
console.log('eventName:', context.eventName);
console.log('sha:', context.sha);
console.log('ref:', context.ref);
console.log('workflow:', context.workflow);
console.log('action:', context.action);
console.log('actor:', context.actor);
console.log('job:', context.job);
console.log('runNumber:', context.runNumber);
console.log('runId:', context.runId);
console.log('apiUrl:', context.apiUrl);
console.log('serverUrl:', context.serverUrl);
console.log('graphqlUrl:', context.graphqlUrl);
console.log('-------------------');

console.log('--- Payload ---');
console.log(JSON.stringify(context.payload, undefined, 2));
console.log('---------------');

const CONSONANTS = /[bcdfghjklmnpqrstvwxz]/;
const VOWELS = /[aeiouy]/;

const comparePullRequest = async () => {
  const token: string = getInput('ghToken');
  if (token) {
    const octokit = new GitHub({
      auth: token,
    });
    if (context.payload.pull_request) {
      const result = await octokit.rest.repos.compareCommits({
        owner: context.repo.owner,
        repo: context.repo.repo,
        base: context.payload.pull_request.base.sha,
        head: context.payload.pull_request.head.sha,
        per_page: 100,
      });

      return (result.data.files || [])
        .map(({ patch }) => patch)
        .filter((patch): patch is string => !!patch)
        .map((patch) => {
          return patch
            .split('\\n')
            .filter((line) => line.startsWith('+'))
              .map(addedLine => {
                console.log('added line:', addedLine)
                return addedLine
              })
            .map((addedLine) => ({
              vowelsCount: addedLine.split('').filter((char) => VOWELS.test(char)).length,
              consonantCount: addedLine.split('').filter((char) => CONSONANTS.test(char)).length,
            }));

          // console.log(JSON.stringify(file), undefined, 2);
        })
        .flat()
        .reduce(
          (acc, { vowelsCount, consonantCount }) => {
            acc.vowelsCount += vowelsCount;
            acc.consonantCount += consonantCount;
            return acc;
          },
          {
            vowelsCount: 0,
            consonantCount: 0,
          },
        );
    }
  }

  return null;
};

comparePullRequest().then(console.log.bind(console, 'count:'));
