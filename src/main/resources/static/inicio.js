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
        document.getElementById('welcomeMessage').textContent = `Bienvenido a tu página de finanzas personales, ${username}`;

        fetch(`/api/users/${username}`)
            .then(response => response.json())
            .then(user => {
                if (user) {
                    const formattedBalance = user.balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                    document.getElementById('balanceAmount').textContent = formattedBalance;

                    return user;
                } else {
                    showError('Error al obtener el usuario');
                }
            })
            .then(user => {
                fetch(`/api/transactions/${username}`)
                    .then(response => response.json())
                    .then(transactions => {
                        if (transactions) {
                            transactions.forEach(transaction => {
                                const transactionCard = createTransactionCard(transaction);
                                document.getElementById('transactionCards').appendChild(transactionCard);
                            });
                        } else {
                            showError('Error al obtener las transacciones');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showError('Error al obtener las transacciones');
                    });

                fetch(`/api/categories/${username}`)
                    .then(response => response.json())
                    .then(categories => {
                        if (categories) {
                            updateCategoryOptions(categories);
                        } else {
                            showError('Error al obtener las categorías');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showError('Error al obtener las categorías');
                    });

                // Manejo de la creación de categorías
                document.getElementById('categoryForm').addEventListener('submit', function(event) {
                    event.preventDefault();
                    const categoryName = document.getElementById('categoryName').value;
                    const categoryType = document.getElementById('categoryType').value;

                    const category = { 
                        name: categoryName, 
                        type: categoryType, 
                        username: username // Agrega el nombre de usuario aquí
                    };

                    console.log("Category to be sent:", category); // Verifica el objeto category

                    fetch('/api/categories', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(category)
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text); });
                        }
                        return response.json();
                    })
                    .then(savedCategory => {
                        // Ahora realiza una llamada para obtener todas las categorías y actualizar el dropdown
                        fetch(`/api/categories/${username}`)
                            .then(response => response.json())
                            .then(categories => {
                                updateCategoryOptions(categories); // Actualiza el dropdown con todas las categorías
                                document.getElementById('categoryName').value = '';
                                document.getElementById('categoryType').value = 'Ingreso';
                                showSuccess('Categoría creada correctamente');
                            })
                            .catch(error => {
                                console.error('Error al obtener las categorías después de la creación:', error);
                                showError('Error al obtener las categorías');
                            });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showError('Error al crear la categoría');
                    });
                });
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error al obtener el usuario');
            });

        document.getElementById('transactionForm').addEventListener('submit', function (event) {
            event.preventDefault();
            const selectedCategoryName = document.getElementById('type').value; // Tomar el nombre de la categoría seleccionada
            const amount = parseFloat(document.getElementById('amount').value);

            // Obtener el tipo de categoría (ingreso/gasto) desde las categorías
            fetch(`/api/categories/${username}`)
                .then(response => response.json())
                .then(categories => {
                    const selectedCategory = categories.find(category => category.name === selectedCategoryName);
                    if (selectedCategory) {
                        const transactionType = selectedCategory.type; // Usar el tipo de la categoría
                        const description = selectedCategoryName; // Usar el nombre de la categoría como descripción

                        fetch(`/api/users/${username}`)
                            .then(response => response.json())
                            .then(user => {
                                const transaction = { description, amount, type: transactionType, user: user };

                                fetch('/api/transactions', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(transaction)
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }
                                    return response.json();
                                })
                                .then(savedTransaction => {
                                    const transactionCard = createTransactionCard(savedTransaction);
                                    document.getElementById('transactionCards').appendChild(transactionCard);

                                    showSuccess('Transacción guardada correctamente');

                                    // Obtener y actualizar el balance actual desde la base de datos
                                    fetch(`/api/users/${username}`)
                                        .then(response => response.json())
                                        .then(user => {
                                            if (user) {
                                                const formattedBalance = user.balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                                                document.getElementById('balanceAmount').textContent = formattedBalance;
                                            } else {
                                                showError('Error al obtener el usuario');
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error:', error);
                                            showError('Error al obtener el usuario');
                                        });
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    showError('Error al guardar la transacción');
                                });
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                showError('Error al guardar la transacción');
                            });
                    } else {
                        showError('Categoría seleccionada no válida');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showError('Error al obtener las categorías');
                });
        });

        document.getElementById('createCategoryButton').addEventListener('click', function () {
            const categoryFormCard = document.getElementById('categoryFormCard');
            categoryFormCard.style.display = categoryFormCard.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('logoutLink').addEventListener('click', function() {
            localStorage.clear();
            window.location.href = '/home.html';
        });

        function createTransactionCard(transaction) {
            const card = document.createElement('div');
            card.classList.add('col-md-4', 'mb-3');
            card.id = `transactionCard${transaction.id}`;
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${transaction.description}</h5>
                        <p class="card-text">${transaction.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} (${transaction.type})</p>
                        <button class="btn btn-danger delete-button">Eliminar</button>
                    </div>
                </div>
            `;

            // Agregar evento de click al botón de eliminar
            const deleteButton = card.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => {
                deleteTransaction(transaction.id, transaction.amount, transaction.type);
            });

            return card;
        }

        function deleteTransaction(transactionId, amount, type) {
            fetch(`/api/transactions/${transactionId}`, {
                method: 'DELETE'
            })
            .then(() => {
                const transactionCard = document.getElementById(`transactionCard${transactionId}`);
                if (transactionCard) {
                    transactionCard.remove();
                    showSuccess('Transacción eliminada correctamente');

                    // Obtener y actualizar el balance actual desde la base de datos
                    fetch(`/api/users/${username}`)
                        .then(response => response.json())
                        .then(user => {
                            if (user) {
                                const formattedBalance = user.balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                                document.getElementById('balanceAmount').textContent = formattedBalance;
                            } else {
                                showError('Error al obtener el usuario');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            showError('Error al obtener el usuario');
                        });
                } else {
                    showError('No se pudo encontrar la tarjeta de transacción para eliminar');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error al eliminar la transacción');
            });
        }

        function updateCategoryOptions(categories) {
            const typeSelect = document.getElementById('type');
            typeSelect.innerHTML = ''; // Limpiar opciones anteriores

            categories.forEach(category => {
                if (category.name !== 'Ingreso' && category.name !== 'Gasto') { // Excluir 'Ingreso' y 'Gasto'
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    typeSelect.appendChild(option);
                }
            });
        }

        function showSuccess(message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success mt-3';
            alertDiv.textContent = message;
            document.getElementById('addTransaction').insertAdjacentElement('beforebegin', alertDiv);
            setTimeout(() => {
                alertDiv.remove();
            }, 3000); // Remover la alerta después de 3 segundos
        }

        function showError(message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger mt-3';
            alertDiv.textContent = `Error: ${message}`;
            document.getElementById('addTransaction').insertAdjacentElement('beforebegin', alertDiv);
            setTimeout(() => {
                alertDiv.remove();
            }, 3000); // Remover la alerta después de 3 segundos
        }
    }
});
