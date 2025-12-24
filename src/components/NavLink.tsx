import { NavLink as RouterNavLink, NavLinkProps, useLocation } from "react-router-dom";
import { forwardRef, MouseEvent, useCallback } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, onClick, ...props }, ref) => {
    const location = useLocation();
    
    // Prevent navigation if already on the target route
    const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
      const targetPath = typeof to === 'string' ? to : to.pathname;
      if (location.pathname === targetPath) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    }, [location.pathname, to, onClick]);

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        onClick={handleClick}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
