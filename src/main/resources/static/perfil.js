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
        document.getElementById('welcomeMessage').textContent = `Bienvenido, ${username}`;

        // Event listener para cambiar el nombre de usuario
        document.getElementById('changeUsernameForm').addEventListener('submit', function (event) {
            event.preventDefault();
            const newUsername = document.getElementById('newUsername').value;

            fetch(`/api/users/${username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername }) // Asegúrate de que esto sea un objeto JSON
            })
            .then(response => {
                if (response.ok) {
                    localStorage.setItem('username', newUsername);
                    document.getElementById('welcomeMessage').textContent = `Bienvenido, ${newUsername}`;
                    showSuccess('Nombre de usuario cambiado correctamente');
                    document.getElementById('usernameError').textContent = '';
                    document.getElementById('newUsername').value = '';
                    window.location.reload(); // Recargar la página después de cambiar el nombre de usuario
                } else if (response.status === 400) {
                    response.text().then(text => {
                        showError(text);
                    });
                } else {
                    showError('Error al cambiar el nombre de usuario');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error al cambiar el nombre de usuario');
            });
        });
        document.addEventListener('DOMContentLoaded', function () {
            const username = localStorage.getItem('username');
        
            if (username) {
                fetch(`/api/settings/${username}`)
                    .then(response => response.json())
                    .then(settings => {
                        if (settings.dark_mode) {
                            document.body.classList.add('dark-mode');
                        }
                        document.body.style.fontSize = settings.font_size === 'small' ? '12px' : settings.font_size === 'large' ? '18px' : '16px';
                    })
                    .catch(error => {
                        console.error('Error al aplicar los ajustes:', error);
                    });
            }
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
            // Aquí deberías implementar la lógica para cerrar la cuenta
            // Ejemplo de fetch o llamada a la API para cerrar la cuenta

            // Ejemplo de mensaje de éxito
            showSuccess('Cuenta cerrada correctamente');
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
