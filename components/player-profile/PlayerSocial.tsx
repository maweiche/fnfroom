import { Twitter, Instagram, Video } from "lucide-react";

interface PlayerSocialProps {
  socialLinks: {
    twitter?: string;
    instagram?: string;
    hudl?: string;
  };
}

export function PlayerSocial({ socialLinks }: PlayerSocialProps) {
  const links = [
    {
      name: "Twitter",
      url: socialLinks.twitter,
      icon: Twitter,
      color: "hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500",
    },
    {
      name: "Instagram",
      url: socialLinks.instagram,
      icon: Instagram,
      color: "hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500",
    },
    {
      name: "Hudl",
      url: socialLinks.hudl,
      icon: Video,
      color: "hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500",
    },
  ].filter((link) => link.url);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Connect</h3>
      <div className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 border border-border rounded-lg transition-all duration-150 ${link.color}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
