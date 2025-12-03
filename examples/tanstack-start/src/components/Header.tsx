import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-stone-950/80 backdrop-blur-sm border-b border-stone-800/50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
        <Link to="/" className="text-stone-100 font-medium hover:text-amber-500 transition-colors">
          @inline-edit/react
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-stone-100 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://x.com/n_haberkamp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-stone-100 transition-colors"
          >
            X / Twitter
          </a>
        </nav>
      </div>
    </header>
  );
}
