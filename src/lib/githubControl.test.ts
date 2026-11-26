import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createGithubContributeElement, githubControlFor } from './githubControl.ts';

function gameBlock(source: string, id: string): string {
  const start = source.indexOf(`id: '${id}'`);
  assert.ok(start >= 0, `missing game ${id}`);
  const end = source.indexOf('\n  }', start);
  assert.ok(end > start, `missing end of game ${id}`);
  return source.slice(start, end);
}

describe('GitHub contribute controls', () => {
  const gamesSource = readFileSync(new URL('../data/games.ts', import.meta.url), 'utf8');
  const cardSource = readFileSync(new URL('../components/GameCard.tsx', import.meta.url), 'utf8');

  it('renders GTA Praha and Marooned as disabled buttons with no GitHub href', () => {
    for (const id of ['gta-praha', 'marooned']) {
      const block = gameBlock(gamesSource, id);
      assert.equal(block.includes('githubUrl'), false, id);
      assert.equal(block.includes('github.com'), false, id);

      const leakedUrl = 'https://github.com/smarlify/should-not-render';
      const control = githubControlFor({ id, githubUrl: leakedUrl });
      assert.equal(control.kind, 'disabled');
      assert.equal('href' in control, false);

      const html = renderToStaticMarkup(
        createGithubContributeElement({ id, name: id, githubUrl: leakedUrl }),
      );
      assert.match(html, /<button\b/);
      assert.match(html, /\bdisabled\b/);
      assert.match(html, /Contribute on GitHub/);
      assert.doesNotMatch(html, /<a\b/);
      assert.equal(html.includes('href'), false);
      assert.equal(html.includes('github.com'), false);
    }
  });

  it('keeps working GitHub links for the other games', () => {
    const expected = {
      'crossy-road': 'https://github.com/smarlify/crossy-road-game',
      'traffic-run': 'https://github.com/smarlify/traffic-run-game',
    } as const;

    for (const [id, href] of Object.entries(expected)) {
      const block = gameBlock(gamesSource, id);
      assert.match(block, new RegExp(`githubUrl: '${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));

      const control = githubControlFor({ id, githubUrl: href });
      assert.equal(control.kind, 'link');
      if (control.kind !== 'link') continue;
      assert.equal(control.href, href);

      const html = renderToStaticMarkup(
        createGithubContributeElement({ id, name: id, githubUrl: href }),
      );
      assert.match(html, /<a\b/);
      assert.match(html, new RegExp(`href="${href}"`));
      assert.match(html, /Contribute on GitHub/);
      assert.doesNotMatch(html, /\bdisabled\b/);
    }
  });

  it('renders hub cards through the shared control', () => {
    assert.match(cardSource, /createGithubContributeElement/);
    assert.doesNotMatch(cardSource, /href=\{game\.githubUrl\}/);
  });
});
