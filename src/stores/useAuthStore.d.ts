
// src/stores/useAuthStore.d.ts
declare module '@/stores/useAuthStore' {
  // (Opcional, pero buena práctica) Define el tipo para el usuario si también lo manejas en el store
  // interface User {
  //   id: number | string;
  //   name: string;
  //   email: string;
  //   // ... otras propiedades del usuario
  // }

  interface AuthStoreType {
    /** El token de autenticación del usuario. Es null si no está autenticado. */
    token: string | null;

    // Si tienes un estado para el usuario, también lo declararías:
    // user: User | null;

    /**
     * Establece el token de autenticación y, opcionalmente, los datos del usuario.
     * @param accessToken El token JWT o similar.
     */
    setToken: (accessToken: string) => void;

    /**
     * Cierra la sesión del usuario, limpiando el token y los datos del usuario.
     */
    logout: () => void;

    // Aquí podrías añadir otros getters o acciones que tu store pueda tener
    // Por ejemplo:
    // isAuthenticated: boolean;
    // login: (credentials: any) => Promise<void>;
    // register: (data: any) => Promise<void>;
    // fetchUser: () => Promise<void>;
  }

  /**
   * Hook para acceder al store de autenticación.
   */
  export function useAuthStore(): AuthStoreType;
}
