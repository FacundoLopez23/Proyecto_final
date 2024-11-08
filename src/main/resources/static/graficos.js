document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
        return;
    }

    let charts = {
        categoryChart: null,
        timelineChart: null,
        balanceChart: null,
        typeChart: null
    };

    function getChartOptions(isDarkMode) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: isDarkMode ? '#f8f9fa' : '#333',
                        font: {
                            size: getFontSize()
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: isDarkMode ? '#f8f9fa' : '#333',
                        font: {
                            size: getFontSize()
                        }
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: isDarkMode ? '#f8f9fa' : '#333',
                        font: {
                            size: getFontSize()
                        }
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        };
    }

    function getFontSize() {
        if (document.body.classList.contains('small-font')) {
            return 10;
        } else if (document.body.classList.contains('large-font')) {
            return 16;
        }
        return 12; // tamaño normal
    }

    // Observador para detectar cambios en las clases del body (modo oscuro y tamaño de fuente)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateCharts(); // Actualizar todos los gráficos cuando cambian los ajustes
            }
        });
    });

    observer.observe(document.body, {
        attributes: true
    });

    // Referencias a los gráficos
    let categoryChart;
    let timelineChart;
    let balanceChart;
    let typeChart;

    // Inicializar fechas por defecto
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];

    // Cargar categorías disponibles
    loadCategories();

    // Manejar el envío del formulario de filtros
    document.getElementById('filterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateCharts();
    });

    // Manejar cambios en el tipo de gráfico
    document.getElementById('chartType').addEventListener('change', function() {
        updateCharts();
    });

    function loadCategories() {
        fetch(`/api/categories/${username}`)
            .then(response => response.json())
            .then(categories => {
                const categorySelect = document.getElementById('categoryFilter');
                categorySelect.innerHTML = '<option value="all" selected>Todas las categorías</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error cargando categorías:', error));
    }

    function updateCharts() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const selectedCategories = Array.from(document.getElementById('categoryFilter').selectedOptions)
            .map(option => option.value);
        const chartType = document.getElementById('chartType').value;

        fetch(`/api/transactions/${username}/filtered?startDate=${startDate}&endDate=${endDate}`)
            .then(response => response.json())
            .then(transactions => {
                // Filtrar por categorías si no está seleccionado "todas"
                if (!selectedCategories.includes('all')) {
                    transactions = transactions.filter(t => selectedCategories.includes(t.description));
                }

                updateCategoryChart(transactions, chartType);
                updateTimelineChart(transactions);
                updateBalanceChart(transactions);
                updateTypeChart(transactions, chartType);
            })
            .catch(error => console.error('Error actualizando gráficos:', error));
    }

    function updateCategoryChart(transactions, chartType) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Agrupar transacciones por categoría
        const categoryData = transactions.reduce((acc, t) => {
            if (!acc[t.description]) {
                acc[t.description] = 0;
            }
            acc[t.description] += t.amount;
            return acc;
        }, {});

        if (charts.categoryChart) {
            charts.categoryChart.destroy();
        }

        charts.categoryChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    label: 'Monto por Categoría',
                    data: Object.values(categoryData),
                    backgroundColor: generateColors(Object.keys(categoryData).length)
                }]
            },
            options: getChartOptions(isDarkMode)
        });
    }

    function updateTimelineChart(transactions) {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        // Ordenar transacciones por fecha
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Agrupar transacciones por fecha y calcular el balance neto diario
        const timelineData = {};
        let runningBalance = 0;

        transactions.forEach(t => {
            const date = t.date.split('T')[0];
            if (!timelineData[date]) {
                timelineData[date] = {
                    ingresos: 0,
                    gastos: 0,
                    count: 0,
                    balanceNeto: 0
                };
            }
            
            const amount = Number(t.amount);
            
            // Comparación en minúsculas
            if (t.type.toLowerCase() === 'ingreso') {
                timelineData[date].ingresos += amount;
                runningBalance += amount;
            } else if (t.type.toLowerCase() === 'gasto') {
                timelineData[date].gastos += amount;
                runningBalance -= amount;
            }
            
            timelineData[date].count++;
            timelineData[date].balanceNeto = runningBalance;

            console.log(`Fecha: ${date}, Balance: ${runningBalance}`); // Debug
        });

        const dates = Object.keys(timelineData);
        const balances = dates.map(date => timelineData[date].balanceNeto);

        if (charts.timelineChart) {
            charts.timelineChart.destroy();
        }

        charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Balance Neto Diario',
                    data: balances,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...getChartOptions(document.body.classList.contains('dark-mode')),
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: 'ARS'
                                }).format(value);
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const date = context.label;
                                const data = timelineData[date];
                                return [
                                    `Balance Neto: ${new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS'
                                    }).format(data.balanceNeto)}`,
                                    `Ingresos del día: ${new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS'
                                    }).format(data.ingresos)}`,
                                    `Gastos del día: ${new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS'
                                    }).format(data.gastos)}`,
                                    `Transacciones: ${data.count}`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    function updateBalanceChart(transactions) {
        const ctx = document.getElementById('balanceChart').getContext('2d');
        
        // Ordenar transacciones por fecha
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Calcular balance acumulado por día, invirtiendo la lógica de gastos e ingresos
        let balance = 0;
        const dailyBalances = transactions.reduce((acc, t) => {
            const date = t.date.split('T')[0];
            // Invertimos la lógica: los gastos suman y los ingresos restan
            balance += t.type === 'Gasto' ? -t.amount : t.amount;
            acc[date] = balance;
            return acc;
        }, {});

        if (charts.balanceChart) {
            charts.balanceChart.destroy();
        }

        charts.balanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(dailyBalances),
                datasets: [{
                    label: 'Balance Diario',
                    data: Object.values(dailyBalances),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...getChartOptions(document.body.classList.contains('dark-mode')),
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: 'ARS'
                                }).format(value);
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: 'ARS'
                                }).format(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    }

    function updateTypeChart(transactions, chartType) {
        const ctx = document.getElementById('typeChart').getContext('2d');
        
        // Agrupar transacciones por tipo, ahora los ingresos son positivos y los gastos positivos también
        const typeData = transactions.reduce((acc, t) => {
            if (!acc[t.type]) {
                acc[t.type] = 0;
            }
            // Sumamos todos los valores como positivos
            acc[t.type] += t.amount;
            return acc;
        }, {});

        if (charts.typeChart) {
            charts.typeChart.destroy();
        }

        charts.typeChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: Object.keys(typeData),
                datasets: [{
                    label: 'Distribución por Tipo',
                    data: Object.values(typeData),
                    backgroundColor: ['#28a745', '#dc3545'], // Verde para ingresos, rojo para gastos
                }]
            },
            options: {
                ...getChartOptions(document.body.classList.contains('dark-mode')),
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: 'ARS'
                                }).format(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: 'ARS'
                                }).format(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    }

    function generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(`hsl(${(i * 360) / count}, 70%, 50%)`);
        }
        return colors;
    }

    // Cargar configuración inicial y gráficos
    fetch(`/api/settings/${username}`)
        .then(response => response.json())
        .then(settings => {
            if (settings.darkModeEnabled) {
                document.body.classList.add('dark-mode');
            }
            document.body.classList.remove('small-font', 'large-font');
            if (settings.fontSize !== 'normal') {
                document.body.classList.add(`${settings.fontSize}-font`);
            }
            updateCharts();
        })
        .catch(error => console.error('Error al cargar configuración:', error));
}); 