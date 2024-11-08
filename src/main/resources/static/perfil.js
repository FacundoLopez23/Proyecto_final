document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;

    // Obtener todos los elementos de la barra de navegación
    const navItems = document.querySelectorAll('.nav-item');

    // Iterar sobre los elementos y añadir la clase 'active' al botón correspondiente
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });

    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = '/login.html';
    } else {
        // Obtener el género del usuario y actualizar el mensaje de bienvenida
        fetch(`/api/users/${username}`)
            .then(response => response.json())
            .then(user => {
                const welcomeMessage = document.getElementById('welcomeMessage');
                switch(user.genero) {
                    case 'masculino':
                        welcomeMessage.textContent = `Bienvenido a tu perfil, ${username}`;
                        break;
                    case 'femenino':
                        welcomeMessage.textContent = `Bienvenida a tu perfil, ${username}`;
                        break;
                    default:
                        welcomeMessage.textContent = `Bienvenid@ a tu perfil, ${username}`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                welcomeMessage.textContent = `Bienvenid@ a tu perfil, ${username}`;
            });

        // Event listener para cambiar el nombre de usuario
        document.getElementById('changeUsernameForm').addEventListener('submit', function (event) {
            event.preventDefault();
            const newUsername = document.getElementById('newUsername').value;

            fetch(`/api/users/${username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
                return response.text();
            })
            .then(result => {
                localStorage.setItem('username', newUsername);
                showSuccess('Nombre de usuario cambiado correctamente');
                document.getElementById('usernameError').textContent = '';
                document.getElementById('newUsername').value = '';
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            })
            .catch(error => {
                console.error('Error:', error);
                showError(error.message || 'Error al cambiar el nombre de usuario');
            });
        });

        // Event listener para cambiar la contraseña
        document.getElementById('changePasswordForm').addEventListener('submit', function (event) {
            event.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;

            fetch(`/api/users/${username}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            })
            .then(response => {
                if (response.ok) {
                    showSuccess('Contraseña cambiada correctamente');
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                } else if (response.status === 400) {
                    response.text().then(text => {
                        showError(text);
                    });
                } else {
                    showError('Error al cambiar la contraseña');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error al cambiar la contraseña');
            });
        });

        // Mostrar u ocultar contraseña al hacer clic en el ícono
        document.querySelectorAll('.toggle-password').forEach(icon => {
            icon.addEventListener('click', function () {
                const targetInputId = icon.getAttribute('data-toggle');
                const targetInput = document.querySelector(targetInputId);

                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    icon.src = 'ojo_on.png'; // Cambiar ícono a ojo_on.png cuando se activa
                } else {
                    targetInput.type = 'password';
                    icon.src = 'ojo_off.png'; // Cambiar ícono a ojo_off.png cuando se desactiva
                }
            });
        });

        // Event listener para cerrar la cuenta
        document.getElementById('confirmCloseAccount').addEventListener('click', function () {
            // Lógica para cerrar la cuenta
            fetch(`/api/users/${username}/deactivate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: 0 }) // Actualizar activo a 0
            })
            .then(response => {
                if (response.ok) {
                    showSuccess('Cuenta cerrada correctamente');
                    setTimeout(() => {
                        // Cerrar la sesión después de cerrar la cuenta
                        localStorage.clear();
                        window.location.href = '/login.html';
                    }, 2000); // Espera 2 segundos antes de cerrar la sesión
                } else {
                    showError('Error al cerrar la cuenta');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error al cerrar la cuenta');
            });
        });

        // Event listener para cerrar sesión
        document.getElementById('logoutLink').addEventListener('click', function () {
            localStorage.clear();
            window.location.href = '/home.html';
        });
    }

    function showSuccess(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.textContent = message;
        document.getElementById('profileOptions').insertAdjacentElement('beforebegin', alertDiv);
        setTimeout(() => {
            alertDiv.remove();
        }, 3000); // Remover la alerta después de 3 segundos
    }

    function showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.textContent = `Error: ${message}`;
        document.getElementById('profileOptions').insertAdjacentElement('beforebegin', alertDiv);
        setTimeout(() => {
            alertDiv.remove();
        }, 3000); // Remover la alerta después de 3 segundos
    }
});
