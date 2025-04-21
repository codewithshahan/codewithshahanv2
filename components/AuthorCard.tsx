"use client";

import Link from "next/link";
import Image from "next/image";

interface AuthorProps {
  username: string;
  name: string;
  avatar: string;
  bio?: string;
}

const AuthorCard: React.FC<AuthorProps> = ({ username, name, avatar, bio }) => {
  // Use default avatar if avatar is empty or null
  const avatarSrc = avatar || "/images/default-avatar.jpg";

  return (
    <Link href={`/author/${username}`} className="flex items-center group">
      <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all relative">
        <Image
          src={avatarSrc}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
          {name}
        </h3>
        {bio && <p className="text-xs text-muted-foreground">{bio}</p>}
      </div>
    </Link>
  );
};

export default AuthorCard;
