import { forwardRef } from 'react';
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { useEncryptedPath } from '@/lib/secureRouting';

type AnchorRef = HTMLAnchorElement;

type BaseProps = { to: string };

type PropsWithChildren<T> = Omit<T, 'to'> & BaseProps;

export const SecureLink = forwardRef<AnchorRef, PropsWithChildren<LinkProps>>(
  function SecureLink({ to, ...props }, ref) {
    const secureTo = useEncryptedPath(to);
    return <Link ref={ref} to={secureTo} {...props} />;
  },
);

export const SecureNavLink = forwardRef<
  AnchorRef,
  PropsWithChildren<NavLinkProps>
>(function SecureNavLink({ to, ...props }, ref) {
  const secureTo = useEncryptedPath(to);
  return <NavLink ref={ref} to={secureTo} {...props} />;
});
