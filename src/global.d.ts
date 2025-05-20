// src/renderer/global.d.ts
interface Window {
  api: {
    addUser: (user: { name: string; email: string }) => Promise<{ success: boolean; error?: string }>;
    getUsers: () => Promise<{ success: boolean; users?: { id: number; name: string; email: string }[]; error?: string }>;
  };
}