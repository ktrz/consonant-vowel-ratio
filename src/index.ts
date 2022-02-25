import { getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { GithubContext } from './types';

function greeting(name: string, repoUrl: string) {
  console.log(`Hello ${name}! You are running a GitHub action in ${repoUrl}`);
}

const inputName = getInput('name');

const getRepoUrl = ({ repo, serverUrl }: GithubContext): string => {
  return `${serverUrl}/${repo.owner}/${repo.repo}`;
};

greeting(inputName, getRepoUrl(context));

const CONSONANTS = /[bcdfghjklmnpqrstvwxz]/;
const VOWELS = /[aeiouy]/;

const comparePullRequest = async () => {
  const token: string = getInput('ghToken');
  if (token) {
    const octokit = getOctokit(token);
    if (context.payload.pull_request) {
      const result = await octokit.rest.repos.compareCommits({
        owner: context.repo.owner,
        repo: context.repo.repo,
        base: context.payload.pull_request.base.sha,
        head: context.payload.pull_request.head.sha,
        per_page: 100,
      });

      return (result.data.files || [])
        .map(({ patch, filename }) => ({
          patch,
          filename,
        }))
        .filter((data): data is { filename: string; patch: string } => !!data.patch)
        .map(({ patch, filename }) => {
          console.log('\n--- Filename ---:', filename);
          return patch
            .split('\n')
            .filter((line) => line.startsWith('+'))
            .map((addedLine) => {
              console.log('added line:', addedLine);
              return addedLine;
            })
            .map((addedLine) => ({
              vowelsCount: addedLine.split('').filter((char) => VOWELS.test(char)).length,
              consonantCount: addedLine.split('').filter((char) => CONSONANTS.test(char)).length,
            }));
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

const postComment = async (comment: string) => {
  const token: string = getInput('ghToken');
  const pullRequest = context.payload.pull_request;
  if (token && pullRequest) {
    const octokit = getOctokit(token);

    const previousComments = (await getPreviousComment()) || [];
    previousComments.sort((a, b) => (new Date(a.submitted_at!) < new Date(b.submitted_at!) ? 1 : -1));

    // some gibberish
    // sdfghlwsgfd
    // sdfghlwsgfd
    // sdfghlwsgfd
    // sdfghlwsgfd
    // sdfghlwsgfd
    // sdfghlwsgfd
    // sdfghlwsgfd
    // sdfghlwsgfd
    // sdfghlwsgfd

    if (previousComments.length) {
      await octokit.rest.pulls.updateReview({
        review_id: previousComments[0].id,
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pullRequest.number,
        body: comment,
      });
    } else {
      await octokit.rest.pulls.createReview({
        event: 'COMMENT',
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pullRequest.number,
        body: comment,
      });
    }
  }
};

const getPreviousComment = async () => {
  const token: string = getInput('ghToken');
  const pullRequest = context.payload.pull_request;
  if (token && pullRequest) {
    const octokit = getOctokit(token);

    const result = await octokit.rest.pulls.listReviews({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequest.number,
    });

    console.log('--- Previous reviews ---');
    console.log(JSON.stringify(result.data), undefined, 2);
    console.log('------------------------');

    return result.data.filter(({ body }) => body.trim().startsWith('# Consonant Vowel Ratio'));
  }
};

comparePullRequest().then(async (data) => {
  if (data) {
    const { vowelsCount, consonantCount } = data;
    const comment = `
# Consonant Vowel Ratio

**Your PR added:**
* ${consonantCount} consonants
* ${vowelsCount} vowels
        
**The consonants to vowels ratio is:** ${(consonantCount / vowelsCount).toFixed(3)}
`;
    console.log(comment);
    await postComment(comment);
  }
});
