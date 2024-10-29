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
        
        // Agrupar transacciones por fecha
        const timelineData = transactions.reduce((acc, t) => {
            const date = t.date.split('T')[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += t.amount;
            return acc;
        }, {});

        if (charts.timelineChart) {
            charts.timelineChart.destroy();
        }

        charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(timelineData),
                datasets: [{
                    label: 'Evolución Temporal',
                    data: Object.values(timelineData),
                    borderColor: '#007bff',
                    fill: false
                }]
            },
            options: getChartOptions(document.body.classList.contains('dark-mode'))
        });
    }

    function updateBalanceChart(transactions) {
        const ctx = document.getElementById('balanceChart').getContext('2d');
        
        // Calcular ingresos y gastos totales
        const totals = transactions.reduce((acc, t) => {
            if (t.type === 'Ingreso') {
                acc.ingresos += t.amount;
            } else {
                acc.gastos += t.amount;
            }
            return acc;
        }, { ingresos: 0, gastos: 0 });

        if (charts.balanceChart) {
            charts.balanceChart.destroy();
        }

        charts.balanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    label: 'Balance',
                    data: [totals.ingresos, totals.gastos],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: getChartOptions(document.body.classList.contains('dark-mode'))
        });
    }

    function updateTypeChart(transactions, chartType) {
        const ctx = document.getElementById('typeChart').getContext('2d');
        
        // Agrupar transacciones por tipo
        const typeData = transactions.reduce((acc, t) => {
            if (!acc[t.type]) {
                acc[t.type] = 0;
            }
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
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: getChartOptions(document.body.classList.contains('dark-mode'))
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