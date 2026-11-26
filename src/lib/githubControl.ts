import { createElement, type ReactElement } from 'react';
import { Facebook, Github } from 'lucide-react';

export const GITHUB_CONTRIBUTE_LABEL = 'Contribute on GitHub';
export const FACEBOOK_LABEL = 'Facebook';

/** Dave's GTA Praha fan page, with Playful's external-link UTMs. */
export const GTA_PRAHA_FACEBOOK_HREF =
  'https://www.facebook.com/profile.php?id=61596461042295&utm_source=playful.smarlify.co&utm_medium=external&utm_campaign=dave';

/** Repos that are no longer public. The hub still shows the control, with no URL. */
const DISABLED_GITHUB_GAME_IDS = new Set(['marooned']);

export type GithubControl =
  | { kind: 'disabled'; label: typeof GITHUB_CONTRIBUTE_LABEL }
  | { kind: 'link'; href: string; label: string; tone: 'github' | 'facebook' }
  | { kind: 'hidden' };

export function githubControlFor(game: { id: string; githubUrl?: string }): GithubControl {
  if (game.id === 'gta-praha') {
    return {
      kind: 'link',
      href: GTA_PRAHA_FACEBOOK_HREF,
      label: FACEBOOK_LABEL,
      tone: 'facebook',
    };
  }
  if (DISABLED_GITHUB_GAME_IDS.has(game.id)) {
    return { kind: 'disabled', label: GITHUB_CONTRIBUTE_LABEL };
  }
  if (game.githubUrl) {
    return { kind: 'link', href: game.githubUrl, label: GITHUB_CONTRIBUTE_LABEL, tone: 'github' };
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
      createElement(Github, { className: 'w-3 h-3 inline mr-1', 'aria-hidden': true }),
      control.label,
    );
  }

  if (control.kind === 'link') {
    const facebook = control.tone === 'facebook';
    return createElement(
      'a',
      {
        href: control.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: linkClassName,
        style: facebook
          ? {
              background: '#1877F2',
              boxShadow: '0 10px 25px -5px rgb(24 119 242 / 0.25)',
            }
          : {
              background: 'linear-gradient(135deg, hsl(0 0% 20%), hsl(0 0% 15%))',
              boxShadow: '0 10px 25px -5px hsl(0 0% 20% / 0.25)',
            },
        onClick: (event: { stopPropagation: () => void }) => {
          event.stopPropagation();
          onLinkClick?.();
        },
      },
      createElement(facebook ? Facebook : Github, { className: 'w-3 h-3 inline mr-1', 'aria-hidden': true }),
      control.label,
    );
  }

  const unreachable: never = control;
  return unreachable;
}
