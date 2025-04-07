import { ReactNode, MouseEvent, CSSProperties } from "react";

type ScrollProps = {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const Scroll = ({
  href,
  children,
  className = "",
  style,
}: ScrollProps) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const elementoAlvo = document.querySelector(href);
      if (elementoAlvo) {
        elementoAlvo.classList.add("highlight");
        setTimeout(() => {
          elementoAlvo.classList.remove("highlight");
        }, 2000);
        setTimeout(() => {
          elementoAlvo.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  return (
    <a
      href={href}
      className={`link-rolagem ${className}`}
      onClick={handleClick}
      style={style}
    >
      {children}
    </a>
  );
};