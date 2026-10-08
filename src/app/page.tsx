'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, Zap, Star, Trophy, Users, Copy, Check, BookOpen, GitPullRequest, Lightbulb, Plus, Briefcase } from 'lucide-react';
import GameCard from '@/components/GameCard';
import { games } from '@/data/games';

export default function Home() {
  const router = useRouter();
  const [featuredGame] = useState(games[0]);
  const [showCryptoPopup, setShowCryptoPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGameClick = (gameId: string) => {
    // Track featured game click event
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('featured_game_click', {
        game_id: gameId,
        event_category: 'game_interaction'
      });
    }
    router.push(`/${gameId}`);
  };

  const copyToClipboard = async (text: string) => {
    // Track copy crypto address event
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('copy_crypto_address', {
        event_category: 'donation_interaction'
      });
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const btcAddress = "bc1qnk53eshq6ja9nl8rdwzgq982s6vmnuqdpancj8";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gaming">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="mb-6 text-white font-bold">
                <span className="inline-block -rotate-1 text-5xl md:text-7xl relative -left-2">Playful</span>
                <span className="inline-block rotate-0 text-2xl md:text-3xl px-4 -top-1 relative opacity-50">by</span>
                <span className="inline-block rotate-1 text-3xl md:text-5xl text-gradient">Smarlify</span>
              </h1>
              <p className="text-xl md:text-2xl text-gaming max-w-3xl mx-auto mb-8">
                Experience the ultimate gaming hub with cutting-edge games
                built with Three.js, WebGL, Unity 3D and other.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <div className="gaming-card p-6 text-center">
                <Gamepad2 className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-sm text-muted-foreground">Games</div>
              </div>
              <div className="gaming-card p-6 text-center">
                <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">60fps</div>
                <div className="text-sm text-muted-foreground">Performance</div>
              </div>
              <div className="gaming-card p-6 text-center">
                <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">∞</div>
                <div className="text-sm text-muted-foreground">High Scores</div>
              </div>
              <div className="gaming-card p-6 text-center">
                <Users className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Free</div>
                <div className="text-sm text-muted-foreground">To Play</div>
              </div>
            </div>

            {/* Featured Game */}
            <div className="max-w-4xl mx-auto">
              <div 
                className="gaming-card p-8 text-left group cursor-pointer"
                onClick={() => handleGameClick(featuredGame.id)}
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="aspect-video w-full md:w-1/2 rounded-xl relative overflow-hidden">
                    <img 
                      src={featuredGame.thumbnail} 
                      alt={featuredGame.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Gamepad2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-accent" />
                      <span className="text-accent font-semibold">Featured Game</span>
                      {featuredGame.status === 'early-access' && (
                        <span className="bg-amber-400/90 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                          Early Access
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">{featuredGame.name}</h2>
                    <p className="text-gaming mb-4">{featuredGame.description}</p>
                    <div className="btn-gaming inline-flex items-center">
                      <Gamepad2 className="w-5 h-5 inline mr-2" />
                      Play {featuredGame.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your <span className="text-gradient">Adventure</span>
            </h2>
            <p className="text-xl text-gaming max-w-2xl mx-auto">
              From island survival to high-speed racing and endless running, discover our collection of premium games.
            </p>
          </div>
          <div className="games-grid">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handleGameClick(game.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/*
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="text-gradient">Our Games</span>
            </h2>
            <p className="text-xl text-gaming max-w-2xl mx-auto">
              Built with cutting-edge technologies for the best gaming experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="gaming-card p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gaming">
                Optimized for 60fps gameplay with WebGL and Three.js for smooth, responsive gaming.
              </p>
            </div>

            <div className="gaming-card p-8 text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">No Downloads</h3>
              <p className="text-gaming">
                Play instantly in your browser - no downloads, no installations, just pure gaming fun.
              </p>
            </div>

            <div className="gaming-card p-8 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Global Leaderboards</h3>
              <p className="text-gaming">
                Compete with players worldwide and climb the leaderboards in each game.
              </p>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Participate Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="inline-block -rotate-1 text-3xl md:text-4xl">Participate</span>
            </h2>
            <p className="text-xl text-gaming max-w-3xl mx-auto">
              Join our gaming community and help us build amazing experiences together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Add Your Game */}
            <div className="gaming-card p-6 text-center group">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Add Your Game</h3>
              <p className="text-gaming mb-6">
                Have an online game you&apos;d like to showcase? We&apos;d love to feature it on our platform!
              </p>
              <a
                href="mailto:dave@smarlify.co?subject=Game Submission"
                className="btn-gaming inline-flex items-center"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px #a855f7 / 0.25'
                }}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.trackEvent) {
                    window.trackEvent('submit_game_click', {
                      event_category: 'participation_interaction'
                    });
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Game
              </a>
            </div>
            
            {/* Request Features / Report Bugs */}
            <div className="gaming-card p-6 text-center group">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Request Feature</h3>
              <p className="text-gaming mb-6">
                Have an idea for a new game feature? Found a bug? Let us know on GitHub!
              </p>
              <a
                href="https://github.com/orgs/smarlify/repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gaming inline-flex items-center"
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px #059669 / 0.25'
                }}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.trackEvent) {
                    window.trackEvent('create_issue_click', {
                      event_category: 'participation_interaction'
                    });
                  }
                }}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Create Issue
              </a>
            </div>

            {/* Contribute */}
            <div className="gaming-card p-6 text-center group">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <GitPullRequest className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Contribute</h3>
              <p className="text-gaming mb-6">
                Help us improve our games by contributing code, fixing bugs, or adding features.
              </p>
              <a
                href="https://github.com/orgs/smarlify/repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gaming inline-flex items-center"
                style={{
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px #6b7280 / 0.25'
                }}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.trackEvent) {
                    window.trackEvent('make_pr_click', {
                      event_category: 'participation_interaction'
                    });
                  }
                }}
              >
                <GitPullRequest className="w-4 h-4 mr-2" />
                Make PR
              </a>
            </div>

            {/* Learn & Share */}
            <div className="gaming-card p-6 text-center group">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Learn & Share</h3>
              <p className="text-gaming mb-6">
                Our games are open source with MIT license. Learn from our code and share it with others!
              </p>
              <a
                href="https://github.com/orgs/smarlify/repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gaming inline-flex items-center"
                style={{
                  background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px #0891b2 / 0.25'
                }}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.trackEvent) {
                    window.trackEvent('view_source_click', {
                      event_category: 'participation_interaction'
                    });
                  }
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Source
              </a>
            </div>

            {/* Hire Us */}
            <div className="gaming-card p-6 text-center group">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Hire Us</h3>
              <p className="text-gaming mb-6">
                Need a game built? We create amazing gaming experiences tailored to your needs.
              </p>
              <a
                href="https://smarlify.co?utm_source=playful&utm_medium=referral&utm_campaign=hire_us"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gaming inline-flex items-center"
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #be185d)',
                  color: '#ffffff',
                  boxShadow: '0 10px 25px -5px #ec4899 / 0.25'
                }}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.trackEvent) {
                    window.trackEvent('contact_us_click', {
                      event_category: 'business_interaction'
                    });
                  }
                }}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Contact Us
              </a>
            </div>

            {/* Sponsor */}
            <div className="gaming-card p-6 text-center group">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">☕</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Sponsor Us</h3>
              <p className="text-gaming mb-6">
                Support our development efforts. Buy us a coffee or send us a crypto donation.
              </p>
              <div className="space-y-2">
                <div className="flex justify-center items-center gap-4">
                  <a
                    href="https://buymeacoffee.com/smarlify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gaming inline-flex items-center w-1/3"
                    style={{
                      background: 'linear-gradient(135deg, #FFDD00, #FFC700)',
                      color: '#000000',
                      boxShadow: '0 10px 25px -5px #FFDD00 / 0.25'
                    }}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.trackEvent) {
                        window.trackEvent('buy_coffee_click', {
                          event_category: 'donation_interaction'
                        });
                      }
                    }}
                  >
                    <small className="hidden mr-1">Buy us</small>
                    <span className="mr-2">☕</span> Coffee
                  </a>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.trackEvent) {
                        window.trackEvent('crypto_donation_click', {
                          event_category: 'donation_interaction'
                        });
                      }
                      setShowCryptoPopup(true);
                    }}
                    className="btn-gaming inline-flex items-center w-1/3"
                    style={{
                      background: 'linear-gradient(135deg, #f7931a, #ff9500)',
                      color: '#ffffff',
                      boxShadow: '0 10px 25px -5px #f7931a / 0.25'
                    }}
                  >
                    <small className="hidden mr-1">Send us</small>
                    <span className="mr-2">₿</span> Crypto
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                <span className="inline-block -rotate-1 text-3xl md:text-4xl">Playful</span>
                <span className="inline-block rotate-0 text-lg md:text-xl px-3 -top-1 relative opacity-50">by</span>
                <span className="inline-block rotate-1 text-2xl md:text-3xl text-gradient">Smarlify</span>
              </h3>
              <p className="text-gray-200">The ultimate gaming hub for modern games</p>
            </div>
            
            {/* Credits */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <span>Designed by</span>
                <a 
                  href="https://lovable.dev?via=david-nekovar&utm_source=playful&utm_medium=referral&utm_campaign=footer"
            target="_blank"
            rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-200 hover:text-pink-500 transition-colors duration-300 group"
          >
                  <img src="/lovable-logo.svg" alt="Lovable" className="w-4 h-4 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                  Lovable
          </a>
        </div>
              
              <div className="flex items-center gap-2">
                <span>Fine-tuned with</span>
        <a
                  href="https://cursor.sh?utm_source=playful&utm_medium=referral&utm_campaign=footer"
          target="_blank"
          rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-200 hover:text-pink-500 transition-colors duration-300 group"
                >
                  <img src="/cursor-logo.svg" alt="Cursor" className="w-4 h-4 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                  Cursor
                </a>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Powered by</span>
                <a 
                  href="https://heroku.com?utm_source=playful&utm_medium=referral&utm_campaign=footer"
          target="_blank"
          rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-200 hover:text-pink-500 transition-colors duration-300 group"
                >
                  <img src="/heroku-logo.svg" alt="Heroku" className="w-4 h-4 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                  Heroku
                </a>
              </div>
            </div>
            
            {/* Copyright */}
            {/*
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
                <span>Made by</span>
                <a 
                  href="https://smarlify.co?utm_source=playful&utm_medium=referral&utm_campaign=footer"
          target="_blank"
          rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-400 hover:text-pink-500 transition-colors duration-300 group"
                >
                  <img src="/smarlify-white.svg" alt="Smarlify" className="w-4 h-4 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                  Smarlify
                </a>
              </div>
            */}
            
            <div className="text-xs text-gray-400">
              <p>All games are free to play. No registration required.</p>
              <p className='mt-2'>&copy; {new Date().getFullYear()} Smarlify.co. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Crypto Donation Popup */}
      {showCryptoPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="gaming-card p-8 max-w-lg w-full relative">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.trackEvent) {
                  window.trackEvent('crypto_popup_close', {
                    event_category: 'donation_interaction'
                  });
                }
                setShowCryptoPopup(false);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">₿</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Send Bitcoin</h3>
              <p className="text-gaming">Support our development with a Bitcoin donation</p>
            </div>

            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(btcAddress)}`}
                    alt="Bitcoin QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Bitcoin Address:</label>
                <div className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                  <code className="flex-1 text-sm text-white font-mono break-all">
                    {btcAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(btcAddress)}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm text-center">Address copied to clipboard!</p>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.trackEvent) {
                      window.trackEvent('crypto_popup_close_button', {
                        event_category: 'donation_interaction'
                      });
                    }
                    setShowCryptoPopup(false);
                  }}
                  className="btn-gaming"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
