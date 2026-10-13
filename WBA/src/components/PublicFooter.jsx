export default function PublicFooter() {
  return <footer className="wba-footer"><div className="wba-footer-content">
    <p>&copy; {new Date().getFullYear()} WBA Inc. All rights reserved.</p>
    <nav className="wba-footer-links" aria-label="Footer navigation">
      {[['privacy', 'Privacy Policy'], ['terms', 'Terms of Service'], ['help', 'Help Center'], ['contact', 'Contact Support']].map(([route, label]) => <a key={route} href={`#/${route}`}>{label}</a>)}
    </nav>
  </div></footer>;
}
