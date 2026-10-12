// Shown instead of a crash when MongoDB cannot be reached.
export default function DbErrorNotice() {
  return (
    <div className="notice notice-error" role="alert">
      <strong>We could not load this section.</strong>
      <p>
        The database is not reachable right now. If you are running ReWear locally, check that <code>MONGODB_URI</code> in{' '}
        <code>.env.local</code> is correct and that your IP address is allowed in MongoDB Atlas, then restart the server.
      </p>
    </div>
  );
}
