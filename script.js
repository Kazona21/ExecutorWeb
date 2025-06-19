document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/executors';
    const executorsList = document.getElementById('executors-list');
    const totalCount = document.getElementById('total-count');
    const onlineCount = document.getElementById('online-count');
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.createElement('select');
    
    let executorsData = {};
    let currentCategory = 'all';
    let flattenedData = [];
    let lastFetchTime = null;

    // Setup category selector as buttons instead of dropdown
    function setupCategorySelector() {
        const categories = [
            { value: 'all', label: 'All Categories', icon: 'fas fa-globe' },
            { value: 'android', label: 'Android', icon: 'fab fa-android' },
            { value: 'ios', label: 'iOS', icon: 'fab fa-apple' },
            { value: 'windows', label: 'Windows', icon: 'fab fa-windows' },
            { value: 'macos', label: 'macOS', icon: 'fab fa-apple' },
            { value: 'external', label: 'External', icon: 'fas fa-external-link-alt' }
        ];
        
        const categoryButtons = document.createElement('div');
        categoryButtons.id = 'category-buttons';
        categoryButtons.className = 'category-buttons';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.dataset.value = category.value;
            
            // Create icon element
            const icon = document.createElement('i');
            icon.className = category.icon;
            button.appendChild(icon);
            
            // Create text span
            const textSpan = document.createElement('span');
            textSpan.textContent = category.label;
            button.appendChild(textSpan);
            
            if (category.value === 'all') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                button.appendChild(ripple);
                
                // Remove ripple after animation completes
                setTimeout(() => {
                    ripple.remove();
                }, 1000);
                
                // Update current category and filter
                currentCategory = category.value;
                filterAndRenderExecutors();
            });
            
            categoryButtons.appendChild(button);
        });
        
        const searchContainer = document.querySelector('.search-container');
        searchContainer.appendChild(categoryButtons);
    }

    // Fetch data from API
    async function fetchExecutors() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            executorsData = data;
            lastFetchTime = new Date();
            
            flattenedData = [];
            for (const category in data) {
                if (Array.isArray(data[category])) {
                    data[category].forEach(executor => {
                        flattenedData.push({
                            ...executor,
                            category: category
                        });
                    });
                }
            }
            
            filterAndRenderExecutors();
        } catch (error) {
            executorsList.innerHTML = '<p class="loading">Error loading executors. Please try again later.</p>';
        }
    }

    // Filter and render executors based on search and category
    function filterAndRenderExecutors() {
        const searchTerm = searchInput.value.toLowerCase();
        
        let filteredData = flattenedData;
        
        // Filter by category if not 'all'
        if (currentCategory !== 'all') {
            filteredData = filteredData.filter(executor => executor.category === currentCategory);
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredData = filteredData.filter(executor => 
                (executor.title && executor.title.toLowerCase().includes(searchTerm)) ||
                (executor.name && executor.name.toLowerCase().includes(searchTerm))
            );
        }
        
        updateStats(filteredData);
        renderExecutors(filteredData);
    }

    // Update statistics
    function updateStats(data) {
        totalCount.textContent = data.length;
        const online = data.filter(executor => executor.status === 'Online').length;
        onlineCount.textContent = online;
    }

    // Render executors list
    function renderExecutors(data) {
        executorsList.innerHTML = '';
        
        if (data.length === 0) {
            executorsList.innerHTML = '<p class="loading">No executors found.</p>';
            return;
        }

        data.forEach(executor => {
            const card = document.createElement('div');
            card.className = 'executor-card';
            
            const statusClass = executor.status === 'Online' ? 'status-online' : 'status-offline';
            const categoryBadge = `<span class="category-badge ${executor.category}">${executor.category}</span>`;
            const priceBadge = executor.price ? `<span class="price-badge">$${executor.price}</span>` : '';
            
            // Ensure URLs are safe
            const downloadUrl = executor.download_url || '#';
            const purchaseUrl = executor.purchase_url || '#';
            const discordUrl = executor.discord_url || '#';
            const vngUrl = executor.vng_url || '#';
            
            // Get custom button text or use defaults
            const downloadText = executor.download_text || 'Download';
            const purchaseText = executor.purchase_text || 'Purchase';
            
            card.innerHTML = `
                <div class="card-header">
                    ${executor.image_url ? `<img src="${executor.image_url}" alt="${executor.title || executor.name}" class="executor-logo">` : ''}
                    <h3>${executor.title || executor.name || 'Unknown Executor'}</h3>
                    ${categoryBadge}
                    ${priceBadge}
                </div>
                <div class="executor-info">
                    <span>Status:</span>
                    <span class="${statusClass}">${executor.status}</span>
                </div>
                ${executor.VNGversion ? `
                <div class="executor-info">
                    <span>Version:</span>
                    <span>${executor.VNGversion}</span>
                </div>` : ''}
                ${executor.price ? `
                <div class="executor-info">
                    <span>Price:</span>
                    <span class="price-value">$${executor.price}</span>
                </div>` : ''}
                <div class="executor-links">
                    ${executor.download_url ? `<a href="${downloadUrl}" target="_blank" class="download-btn"><i class="fas fa-download btn-icon"></i> ${downloadText}</a>` : ''}
                    ${executor.purchase_url ? `<a href="${purchaseUrl}" target="_blank" class="purchase-btn"><i class="fas fa-shopping-cart btn-icon"></i> ${purchaseText}</a>` : ''}
                    ${executor.discord_url ? `<a href="${discordUrl}" target="_blank" class="discord-btn"><i class="fab fa-discord btn-icon"></i> Discord</a>` : ''}
                    ${executor.vng_url ? `<a href="${vngUrl}" target="_blank" class="vng-btn"><i class="fas fa-globe btn-icon"></i> VNG</a>` : ''}
                </div>
            `;
            
            // Add event listeners to ensure links work
            const links = card.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href') === '#') {
                        e.preventDefault();
                    }
                });
            });
            
            // Add animation delay for staggered appearance
            card.style.animationDelay = `${data.indexOf(executor) * 0.05}s`;
            
            executorsList.appendChild(card);
        });
    }

    // Search functionality
    searchInput.addEventListener('input', filterAndRenderExecutors);

    // Setup and initial fetch
    setupCategorySelector();
    fetchExecutors();
    
    // Refresh data every 60 seconds
    setInterval(fetchExecutors, 60000);
    
    // Console panel functionality
    const clearConsoleBtn = document.getElementById('clear-console');
    const toggleConsoleBtn = document.getElementById('toggle-console');
    const consoleBody = document.getElementById('console-body');
    
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', () => {
            consoleBody.innerHTML = '';
        });
    }
    
    if (toggleConsoleBtn) {
        toggleConsoleBtn.addEventListener('click', () => {
            consoleBody.classList.toggle('collapsed');
            toggleConsoleBtn.querySelector('i').classList.toggle('fa-chevron-down');
            toggleConsoleBtn.querySelector('i').classList.toggle('fa-chevron-up');
        });
    }
});

// Thêm hiệu ứng ánh sáng và ngôi sao
document.addEventListener('DOMContentLoaded', function() {
    // Thêm hiệu ứng ánh sáng
    const body = document.body;
    
    // Tạo các hiệu ứng ánh sáng
    for (let i = 1; i <= 4; i++) {
        const lightEffect = document.createElement('div');
        lightEffect.className = `light-effect light-effect-${i}`;
        body.appendChild(lightEffect);
    }
    
    // Tạo hiệu ứng ngôi sao
    createStars();
    
    // Các code khởi tạo khác...
});

// Tạo hiệu ứng ngôi sao
function createStars() {
    const body = document.body;
    const starCount = 50;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Vị trí ngẫu nhiên
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Thời gian và độ trễ ngẫu nhiên
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.5 + 0.3;
        
        // Thiết lập style
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.setProperty('--delay', `${delay}s`);
        star.style.setProperty('--opacity', opacity);
        
        // Kích thước ngẫu nhiên
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Thêm vào body
        body.appendChild(star);
    }
}

// Thêm hiệu ứng particle cho footer
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Random size
    const size = Math.random() * 4 + 2;
    
    // Random color
    const colors = ['rgba(0, 188, 212, 0.5)', 'rgba(61, 220, 132, 0.5)', 'rgba(255, 64, 129, 0.3)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Random animation duration
    const duration = Math.random() * 20 + 10;
    
    // Set styles
    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    
    // Set animation
    particle.style.animation = `floatParticle ${duration}s linear infinite`;
    
    // Add to container
    container.appendChild(particle);
    
    // Create keyframes for this particle
    const keyframes = `
    @keyframes floatParticle {
        0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: ${Math.random() * 0.5 + 0.3};
        }
        25% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
            opacity: ${Math.random() * 0.5 + 0.5};
        }
        50% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
            opacity: ${Math.random() * 0.5 + 0.3};
        }
        75% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
            opacity: ${Math.random() * 0.5 + 0.5};
        }
        100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: ${Math.random() * 0.5 + 0.3};
        }
    }`;
    
    // Add keyframes to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
}

// Initialize footer particles
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('.site-footer');
    
    // Create particles
    for (let i = 0; i < 15; i++) {
        createParticle(footer);
    }
    
    // Add hover effect to dev names
    const devNames = document.querySelectorAll('.dev-name');
    devNames.forEach(name => {
        name.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
            this.style.textShadow = '0 0 20px rgba(61, 220, 132, 0.8)';
        });
        
        name.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
            this.style.textShadow = '0 0 8px rgba(61, 220, 132, 0.5)';
        });
    });
});












