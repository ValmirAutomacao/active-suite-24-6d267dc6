import { useAuth } from '@/contexts/AuthContext';

const AuthDebug = () => {
  const { user, profile, isLoading, session } = useAuth();

  return (
    <div className="p-4 bg-gray-100 border rounded">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <div className="space-y-2 text-sm">
        <div>Loading: {isLoading ? 'true' : 'false'}</div>
        <div>User: {user ? user.email : 'null'}</div>
        <div>Session: {session ? 'existe' : 'null'}</div>
        <div>Profile: {profile ? JSON.stringify(profile, null, 2) : 'null'}</div>
      </div>
    </div>
  );
};

export default AuthDebug;