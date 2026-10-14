import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGameById } from '@/data/games';
import GameIframe from '@/components/GameIframe';

interface GamePageProps {
  params: Promise<{
    game: string;
  }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { game: gameId } = await params;
  const game = getGameById(gameId);
  
  if (!game) {
    return {
      title: 'Game Not Found - Playful by Smarlify',
      description: 'The requested game could not be found on our gaming hub.',
    };
  }

  const isListed = game.listed !== false;
  const gameUrl = `https://playful.smarlify.co/${game.id}`;
  const fullTitle = `${game.name} - Play Online | Playful by Smarlify`;

  return {
    title: fullTitle,
    description: `${game.description} Play ${game.name} for free in your browser. Built with ${game.tech.join(', ')}.`,
    keywords: isListed
      ? [
          game.name,
          ...game.tech,
          'web game',
          'browser game',
          'online game',
          'free game',
          'Smarlify',
          'Playful',
          'play online',
          'gaming hub',
          ...game.features
        ]
      : undefined,
    authors: [{ name: "Smarlify", url: "https://github.com/smarlify" }],
    creator: "Smarlify",
    publisher: "Smarlify",
    metadataBase: new URL("https://playful.smarlify.co"),
    alternates: {
      canonical: gameUrl,
    },
    openGraph: isListed
      ? {
          title: fullTitle,
          description: `${game.description} Play ${game.name} for free in your browser.`,
          type: 'website',
          url: gameUrl,
          siteName: 'Playful by Smarlify',
          locale: 'en_US',
          images: [
            {
              url: game.thumbnail,
              width: 1200,
              height: 630,
              alt: `${game.name} - Play Online | Playful by Smarlify`,
              type: 'image/png',
            },
          ],
        }
      : undefined,
    twitter: isListed
      ? {
          card: 'summary_large_image',
          site: '@smarlify',
          creator: '@smarlify',
          title: fullTitle,
          description: `${game.description} Play ${game.name} for free in your browser.`,
          images: [game.thumbnail],
        }
      : undefined,
    robots: {
      index: isListed,
      follow: isListed,
      googleBot: {
        index: isListed,
        follow: isListed,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { game: gameId } = await params;
  const game = getGameById(gameId);
  
  if (!game) {
    notFound();
  }

  const gameUrl = `https://playful.smarlify.co/${game.id}`;

  return (
    <>
      {/* Structured Data for Game */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": game.name,
            "description": game.description,
            "url": gameUrl,
            "image": `https://playful.smarlify.co${game.thumbnail}`,
            "genre": game.features,
            "gamePlatform": "Web Browser",
            "operatingSystem": "Any",
            "applicationCategory": "Game",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Smarlify",
              "url": "https://smarlify.co"
            },
            "author": {
              "@type": "Organization",
              "name": "Smarlify",
              "url": "https://smarlify.co"
            },
            "datePublished": game.publishedDate,
            "inLanguage": "en",
            "isAccessibleForFree": true,
            "playMode": "SinglePlayer",
            "gameItem": game.features.map(feature => ({
              "@type": "Thing",
              "name": feature
            }))
          })
        }}
      />
      <GameIframe game={game} />
    </>
  );
}
