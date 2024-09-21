document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('registrationForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const data = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value
        };

        fetch('/api/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                alert("Registro exitoso. Redirigiendo a la página de inicio de sesión...");
                window.location.href = '/login.html';
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        }).catch(error => {
            alert("Error en el registro: " + error.message);
        });
    });

    document.getElementById('loginButton').addEventListener('click', function () {
        window.location.href = '/login.html';
    });

    document.getElementById('backButton').addEventListener('click', function () {
        window.location.href = 'home.html';
    });

    // Toggle de visibilidad de contraseña
    document.querySelectorAll('.toggle-password').forEach(item => {
        item.addEventListener('click', function () {
            const toggleId = this.getAttribute('data-toggle');
            const passwordField = document.querySelector(toggleId);
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                this.src = 'ojo_on.png'; // Cambia a icono de ojo abierto
            } else {
                passwordField.type = 'password';
                this.src = 'ojo_off.png'; // Cambia a icono de ojo cerrado
            }
        });
    });
});
