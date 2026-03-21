export default async (request, context) => {
  const url = new URL(request.url);

  // Allow access to the password page and static assets
  const allowed = ['/password.html', '/styles.css', '/marketing.css'];
  if (allowed.includes(url.pathname) || url.pathname.startsWith('/.netlify')) {
    return context.next();
  }

  // Check for auth cookie
  const cookie = request.headers.get('cookie') || '';
  if (cookie.includes('gnv_demo_auth=granted')) {
    return context.next();
  }

  // Not authenticated — redirect to password page
  return Response.redirect(new URL('/password.html', request.url), 302);
};

export const config = { path: "/*" };
