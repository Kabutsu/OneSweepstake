'use client';

export default function LogoutButton() {
  const handleLogout = () => {
    window.location.href = '/auth/signout';
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  );
}
