document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');

    // Función para mostrar u ocultar la contraseña al hacer clic en el ícono del ojo
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Cambiar el ícono entre ojo abierto y cerrado
        this.src = type === 'password' ? 'ojo_off.png' : 'ojo_on.png';
    });

    // Función para redirigir al formulario de registro
    function redirectToRegistration() {
        window.location.href = 'registration.html';
    }

    // Función para manejar el envío del formulario de inicio de sesión
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const data = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        fetch('/api/registration/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud.');
            }
            return response.json(); // Aquí asumimos que el backend devuelve un JSON con los datos del usuario, incluyendo 'activo'
        })
        .then(userData => {
            if (userData.activo === 0) {
                // Si la cuenta está desactivada, no permitir acceso
                throw new Error('La cuenta se encuentra cerrada.');
            }
            if (userData.message === 'Login successful') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', document.getElementById('username').value);
                window.location.href = '/inicio.html'; // Redirige a la página de inicio
            } else {
                throw new Error(userData.message);
            }
        })
        .catch(error => {
            // Manejo de errores específicos
            handleLoginError(error.message);
        });
    });

    // Redirigir al formulario de registro al hacer clic en el botón correspondiente
    document.getElementById('regButton').addEventListener('click', redirectToRegistration);

    // Función para manejar errores de validación y mostrar mensajes adecuados
    function handleLoginError(errorMessage) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        usernameInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');

        if (errorMessage.includes('Usuario incorrecto')) {
            usernameInput.classList.add('is-invalid');
            document.querySelector('.username-error').textContent = 'Usuario incorrecto.';
        } else {
            usernameInput.classList.add('is-valid');
        }

        if (errorMessage.includes('Contraseña incorrecta')) {
            passwordInput.classList.add('is-invalid');
            document.querySelector('.password-error').textContent = 'Contraseña incorrecta.';
        } else if (errorMessage.includes('cerrada')) {
            usernameInput.classList.add('is-invalid');
            document.querySelector('.username-error').textContent = 'La cuenta se encuentra cerrada.';
        } else {
            passwordInput.classList.add('is-valid');
        }
    }
});
