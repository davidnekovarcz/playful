import { createElement, type ReactElement } from 'react';
import { Github } from 'lucide-react';

export const GITHUB_CONTRIBUTE_LABEL = 'Contribute on GitHub';

/** Repos that are no longer public. The hub still shows the control, with no URL. */
const DISABLED_GITHUB_GAME_IDS = new Set(['gta-praha', 'marooned']);

export type GithubControl =
  | { kind: 'disabled'; label: typeof GITHUB_CONTRIBUTE_LABEL }
  | { kind: 'link'; href: string; label: typeof GITHUB_CONTRIBUTE_LABEL }
  | { kind: 'hidden' };

export function githubControlFor(game: { id: string; githubUrl?: string }): GithubControl {
  if (DISABLED_GITHUB_GAME_IDS.has(game.id)) {
    return { kind: 'disabled', label: GITHUB_CONTRIBUTE_LABEL };
  }
  if (game.githubUrl) {
    return { kind: 'link', href: game.githubUrl, label: GITHUB_CONTRIBUTE_LABEL };
  }
  return { kind: 'hidden' };
}

const linkClassName =
  'text-white md:p-4 p-3 rounded-lg font-semibold text-sm cursor-pointer border-none inline-flex items-center justify-center transition-all duration-300 hover:scale-105';

const disabledClassName =
  'text-white/50 md:p-4 p-3 rounded-lg font-semibold text-sm cursor-not-allowed border-none inline-flex items-center justify-center opacity-60';

export function createGithubContributeElement(
  game: { id: string; name: string; githubUrl?: string },
  onLinkClick?: () => void,
): ReactElement | null {
  const control = githubControlFor(game);
  const icon = createElement(Github, { className: 'w-3 h-3 inline mr-1', 'aria-hidden': true });

  if (control.kind === 'hidden') {
    return null;
  }

  if (control.kind === 'disabled') {
    return createElement(
      'button',
      {
        type: 'button',
        disabled: true,
        'aria-disabled': true,
        className: disabledClassName,
        style: {
          background: 'linear-gradient(135deg, hsl(0 0% 30%), hsl(0 0% 25%))',
          boxShadow: 'none',
        },
      },
      icon,
      control.label,
    );
  }

  if (control.kind === 'link') {
    return createElement(
      'a',
      {
        href: control.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: linkClassName,
        style: {
          background: 'linear-gradient(135deg, hsl(0 0% 20%), hsl(0 0% 15%))',
          boxShadow: '0 10px 25px -5px hsl(0 0% 20% / 0.25)',
        },
        onClick: (event: { stopPropagation: () => void }) => {
          event.stopPropagation();
          onLinkClick?.();
        },
      },
      icon,
      control.label,
    );
  }

  const unreachable: never = control;
  return unreachable;
}
