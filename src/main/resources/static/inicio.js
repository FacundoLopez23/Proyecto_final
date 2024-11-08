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
    if (username) {
        // Realizamos la solicitud para obtener la configuración del usuario
        fetch(`/api/settings/${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.darkModeEnabled) {
                    document.body.classList.add("dark-mode"); // Activar el modo oscuro
                }
                document.documentElement.style.fontSize = data.fontSize;  // Aplicar el tamaño de fuente
            })
            .catch(error => console.error("Error al obtener la configuración del usuario:", error));
    }

    if (!username) {
        window.location.href = '/login.html';
    } else {
        document.getElementById('welcomeMessage').textContent = `Bienvenido a tu página de finanzas personales, ${username}`;

        fetch(`/api/users/${username}`)
            .then(response => response.json())
            .then(user => {
                if (user) {
                    const balanceElement = document.getElementById('balanceAmount');
                    const formattedBalance = user.balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                    balanceElement.textContent = formattedBalance;

                    // Cambiar el color del balance según si es positivo o negativo
                    if (user.balance < 0) {
                        balanceElement.style.color = 'red'; // Balance negativo
                    } else {
                        balanceElement.style.color = 'inherit'; // Balance positivo o cero (color por defecto)
                    }

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
                            // Limpiar el contenedor antes de agregar las transacciones
                            document.getElementById('transactionCards').innerHTML = '';
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
            const selectedCategoryName = document.getElementById('type').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const date = document.getElementById('date').value + 'T00:00:00.000Z';

            fetch(`/api/categories/${username}`)
                .then(response => response.json())
                .then(categories => {
                    const selectedCategory = categories.find(category => category.name === selectedCategoryName);
                    if (selectedCategory) {
                        const transactionType = selectedCategory.type;
                        const description = selectedCategoryName;

                        fetch(`/api/users/${username}`)
                            .then(response => response.json())
                            .then(user => {
                                const transaction = { 
                                    description, 
                                    amount, 
                                    type: transactionType, 
                                    date: date,
                                    user: user 
                                };

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

                                                // Cambiar el color del balance después de la transacción
                                                if (user.balance < 0) {
                                                    document.getElementById('balanceAmount').style.color = 'red';
                                                } else {
                                                    document.getElementById('balanceAmount').style.color = 'inherit';
                                                }
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
            
            const date = new Date(transaction.date + 'T00:00:00');
            const formattedDate = date.toLocaleDateString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: 'UTC'
            });

            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${transaction.description}</h5>
                        <p class="card-text">${transaction.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} (${transaction.type})</p>
                        <p class="card-text"><small class="text-muted">Fecha: ${formattedDate}</small></p>
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

                                // Cambiar el color del balance después de eliminar la transacción
                                if (user.balance < 0) {
                                    document.getElementById('balanceAmount').style.color = 'red';
                                } else {
                                    document.getElementById('balanceAmount').style.color = 'inherit';
                                }
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

        document.getElementById('deleteCategoryButton').addEventListener('click', function() {
            // Obtener categorías actuales y llenar el select
            const username = localStorage.getItem('username');
            fetch(`/api/categories/${username}`)
                .then(response => response.json())
                .then(categories => {
                    const select = document.getElementById('categoryToDelete');
                    select.innerHTML = ''; // Limpiar opciones anteriores
                    categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        select.appendChild(option);
                    });
                    $('#deleteCategoryModal').modal('show');
                })
                .catch(error => {
                    console.error('Error:', error);
                    showError('Error al cargar las categorías');
                });
        });

        document.getElementById('confirmDeleteCategory').addEventListener('click', function() {
            const categoryId = document.getElementById('categoryToDelete').value;
            const categoryName = document.getElementById('categoryToDelete').options[document.getElementById('categoryToDelete').selectedIndex].text;

            fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al eliminar la categoría');
                }
                $('#deleteCategoryModal').modal('hide');
                showSuccess(`Categoría "${categoryName}" y sus transacciones eliminadas correctamente`);
                
                // Actualizar la lista de categorías
                const username = localStorage.getItem('username');
                return fetch(`/api/categories/${username}`);
            })
            .then(response => response.json())
            .then(categories => {
                updateCategoryOptions(categories);
                // Actualizar el balance
                return fetch(`/api/users/${username}`);
            })
            .then(response => response.json())
            .then(user => {
                const formattedBalance = user.balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                document.getElementById('balanceAmount').textContent = formattedBalance;
                
                // Actualizar la lista de transacciones
                location.reload(); // Recarga la página para actualizar todas las transacciones
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error al eliminar la categoría');
            });
        });

        // Establecer la fecha actual por defecto
        const now = new Date();
        document.getElementById('date').value = now.toISOString().split('T')[0];

        // Agregar el evento para el cambio de período
        document.getElementById('periodFilter').addEventListener('change', function() {
            loadTransactions(this.value);
        });

        // Función para cargar transacciones
        function loadTransactions(period) {
            const username = localStorage.getItem('username');
            document.getElementById('transactionCards').innerHTML = ''; // Limpiar transacciones existentes
            
            fetch(`/api/transactions/${username}/${period}`)
                .then(response => response.json())
                .then(transactions => {
                    if (transactions && transactions.length > 0) {
                        transactions.forEach(transaction => {
                            const transactionCard = createTransactionCard(transaction);
                            document.getElementById('transactionCards').appendChild(transactionCard);
                        });
                    } else {
                        const noTransactionsMessage = document.createElement('div');
                        noTransactionsMessage.className = 'col-12 text-center';
                        noTransactionsMessage.innerHTML = '<p>No hay transacciones para este período</p>';
                        document.getElementById('transactionCards').appendChild(noTransactionsMessage);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showError('Error al obtener las transacciones');
                });
        }

        // Cargar transacciones iniciales (mes actual por defecto)
        loadTransactions('month');
    }
});
