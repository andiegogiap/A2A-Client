
import type { ApiKeys, GitHubContent } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

const getHeaders = (token: string) => ({
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28'
});

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `GitHub API error: ${response.status}`);
    }
    return response.json();
};

export const getRepoContents = async (apiKeys: ApiKeys, path: string = ''): Promise<GitHubContent[]> => {
    const { githubToken, githubRepo } = apiKeys;
    if (!githubToken || !githubRepo) throw new Error('GitHub token or repository not configured.');
    
    const response = await fetch(`${GITHUB_API_URL}/repos/${githubRepo}/contents/${path}`, {
        headers: getHeaders(githubToken),
    });
    const contents = await handleResponse(response) as GitHubContent[];
    // Sort so directories are listed first
    return contents.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });
};

export const getFileContent = async (apiKeys: ApiKeys, path: string): Promise<{ content: string, sha: string }> => {
    const { githubToken, githubRepo } = apiKeys;
    if (!githubToken || !githubRepo) throw new Error('GitHub token or repository not configured.');

    const response = await fetch(`${GITHUB_API_URL}/repos/${githubRepo}/contents/${path}`, {
        headers: getHeaders(githubToken),
    });
    const data = await handleResponse(response);

    if (data.encoding !== 'base64') {
        throw new Error(`Unsupported file encoding: ${data.encoding}`);
    }
    
    // Decode from base64
    const decodedContent = atob(data.content);
    return { content: decodedContent, sha: data.sha };
};

export const createOrUpdateFile = async (
    apiKeys: ApiKeys, 
    path: string, 
    content: string, 
    commitMessage: string, 
    sha?: string
): Promise<any> => {
    const { githubToken, githubRepo } = apiKeys;
    if (!githubToken || !githubRepo) throw new Error('GitHub token or repository not configured.');

    // Encode to base64
    const encodedContent = btoa(content);
    
    const body = {
        message: commitMessage,
        content: encodedContent,
        sha: sha, // Include SHA for updates, omit for new files
    };

    const response = await fetch(`${GITHUB_API_URL}/repos/${githubRepo}/contents/${path}`, {
        method: 'PUT',
        headers: { ...getHeaders(githubToken), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse(response);
};

export const deleteFile = async (
    apiKeys: ApiKeys,
    path: string,
    commitMessage: string,
    sha: string
): Promise<any> => {
    const { githubToken, githubRepo } = apiKeys;
    if (!githubToken || !githubRepo) throw new Error('GitHub token or repository not configured.');
    
    const body = {
        message: commitMessage,
        sha: sha,
    };
    
    const response = await fetch(`${GITHUB_API_URL}/repos/${githubRepo}/contents/${path}`, {
        method: 'DELETE',
        headers: getHeaders(githubToken),
        body: JSON.stringify(body),
    });
    return handleResponse(response);
};
