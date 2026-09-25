// SEO и производительность улучшения для Efirale
(function() {
    'use strict';

    // Микроразметка товаров — из тех же data/*.json, что и карусели: цена в разметке
    // всегда совпадает с ценой на сайте. Рейтингов нет, пока нет настоящих отзывов.
    const PRODUCT_SOURCES = ['data/perfumes.json', 'data/diffusers.json', 'data/care.json'];

    async function addProductSchema() {
        const lists = await Promise.all(PRODUCT_SOURCES.map(url =>
            fetch(url).then(r => r.ok ? r.json() : []).catch(() => [])
        ));
        const products = lists.flat()
            .filter(item => item.title && item.prices && item.prices.GEL)
            .map(item => ({
                '@type': 'Product',
                'name': item.title.ru || item.title,
                'image': new URL(item.img, document.baseURI).href,
                'description': (item.descr && (item.descr.ru || item.descr)) || undefined,
                'brand': { '@type': 'Brand', 'name': 'Efirale' },
                'offers': {
                    '@type': 'Offer',
                    'priceCurrency': 'GEL',
                    'price': String(item.prices.GEL),
                    'availability': 'https://schema.org/InStock',
                    'seller': { '@type': 'Organization', 'name': 'Efirale' }
                }
            }));
        if (!products.length) return;

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'itemListElement': products.map((product, index) => ({
                '@type': 'ListItem', 'position': index + 1, 'item': product
            }))
        });
        document.head.appendChild(script);
    }

    // Lazy loading для изображений
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Добавляем атрибуты для изображений
    function optimizeImages() {
        const images = document.querySelectorAll('img, div[style*="background-image"]');
        images.forEach(img => {
            if (img.tagName === 'IMG') {
                if (!img.getAttribute('alt')) {
                    img.setAttribute('alt', 'Efirale - натуральные духи и ароматы');
                }
                if (!img.getAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
                // Добавляем width и height для предотвращения layout shift
                if (!img.getAttribute('width') && img.naturalWidth) {
                    img.setAttribute('width', img.naturalWidth);
                }
                if (!img.getAttribute('height') && img.naturalHeight) {
                    img.setAttribute('height', img.naturalHeight);
                }
            }
        });
    }

    // Оптимизация ссылок
    function optimizeLinks() {
        // Внешние ссылки
        document.querySelectorAll('a[href^="http"]:not([href*="efirale.com"])').forEach(link => {
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
        });

        // Телефонные ссылки
        // :contains() — это синтаксис jQuery, в querySelectorAll он бросает SyntaxError
        const phoneLinks = [...document.querySelectorAll('a')].filter(link => link.textContent.includes('+995'));
        phoneLinks.forEach(link => {
            if (!link.getAttribute('href')?.startsWith('tel:')) {
                const phone = link.textContent.replace(/\D/g, '');
                if (phone) {
                    link.setAttribute('href', `tel:+${phone}`);
                }
            }
        });

        // Email ссылки
        const emailLinks = [...document.querySelectorAll('a')].filter(link => link.textContent.includes('@'));
        emailLinks.forEach(link => {
            if (!link.getAttribute('href')?.startsWith('mailto:')) {
                const email = link.textContent.trim();
                if (email.includes('@')) {
                    link.setAttribute('href', `mailto:${email}`);
                }
            }
        });
    }

    // Добавляем навигационные aria-labels
    function improveAccessibility() {
        // Навигация
        const nav = document.querySelector('nav, .t454__mainmenu');
        if (nav && !nav.getAttribute('aria-label')) {
            nav.setAttribute('aria-label', 'Главная навигация');
        }

        // Формы
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.getAttribute('aria-label')) {
                form.setAttribute('aria-label', 'Форма обратной связи');
            }
        });

        // Кнопки
        const buttons = document.querySelectorAll('button, .t-submit');
        buttons.forEach(btn => {
            if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
                btn.setAttribute('aria-label', 'Кнопка действия');
            }
        });

        // Секции
        const sections = document.querySelectorAll('.t-rec');
        sections.forEach((section, index) => {
            if (!section.getAttribute('aria-label')) {
                const title = section.querySelector('.t-title, .t-section__title');
                if (title) {
                    section.setAttribute('aria-label', title.textContent.trim());
                }
            }
        });
    }

    // Оптимизация скроллинга
    function optimizeScrolling() {
        // Плавный скролл для якорных ссылок
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Обновляем URL без перезагрузки
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    }

    // Инициализация всех улучшений
    function init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runEnhancements);
        } else {
            runEnhancements();
        }
    }

    function runEnhancements() {
        addProductSchema();
        initLazyLoading();
        optimizeImages();
        optimizeLinks();
        improveAccessibility();
        optimizeScrolling();

        // Добавляем консольное сообщение для отладки
        console.log('✅ SEO улучшения Efirale загружены успешно');
    }

    // Запускаем инициализацию
    init();

})();
