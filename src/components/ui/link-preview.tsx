import React, { useState } from "react";

interface LinkPreviewProps {
  children: React.ReactNode;
  imageSrc: string;
  className?: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  children,
  imageSrc,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative inline-block w-full h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {isHovered && (
        <div className="absolute top-full left-0 right-0 mt-4 z-50 flex justify-center hidden sm:flex">
          <div className="w-full max-w-sm h-72 rounded-xl overflow-hidden shadow-xl border border-border/50 bg-card">
            <img
              src={imageSrc}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};
