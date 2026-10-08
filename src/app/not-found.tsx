import Link from 'next/link';
import { Home, Gamepad2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen gaming-bg flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="gaming-card p-12">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-gradient mb-4">
              404
            </div>
            <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Game Not Found
            </h1>
                    <p className="text-xl text-gaming mb-6">
                      Oops! The game you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <p className="text-muted-foreground">
                      Don&apos;t worry, we have plenty of other amazing games waiting for you!
                    </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="btn-gaming inline-flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Games
            </Link>
            
            <Link
              href="/"
              className="btn-neon inline-flex items-center justify-center"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Explore All Games
            </Link>
          </div>

          {/* Available Games */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Available Games
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link href="/traffic-run" className="text-primary hover:text-primary/80 transition-colors">
                Traffic Run
              </Link>
              <Link href="/crossy-road" className="text-secondary hover:text-secondary/80 transition-colors">
                Crossy Road
              </Link>
              <Link href="/marooned" className="text-accent hover:text-accent/80 transition-colors">
                Marooned
              </Link>
              <Link href="/crazy-vacuum-3d" className="text-muted-foreground hover:text-white transition-colors">
                Crazy Vacuum 3D
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
