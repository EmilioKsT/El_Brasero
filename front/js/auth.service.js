// Este archivo se encarga de gestionar la "memoria" de la sesión en el navegador

const AuthService = {
    // Guardar la sesión al hacer login
    guardarSesion: (data) => {
        if (data.accessToken) localStorage.setItem('token', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        if (data.rol) localStorage.setItem('rol', data.rol);
    },

    // Obtener el token para las peticiones
    obtenerToken: () => {
        return localStorage.getItem('token');
    },

    // Verificar si tiene sesión activa
    estaLogueado: () => {
        return !!localStorage.getItem('token'); // Devuelve true si existe
    },

    // Cerrar sesión (Borrar todo)
    logout: () => {
        localStorage.clear();
        window.location.href = './login.html';
    },
    
    // Verificar rol (para proteger páginas admin)
    esAdmin: () => {
        return localStorage.getItem('rol') === 'admin';
    }
};