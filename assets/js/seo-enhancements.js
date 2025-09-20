// SEO и производительность улучшения для Efirale
(function() {
    'use strict';

    // Добавляем микроразметку FAQ Schema
    function addFAQSchema() {
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "Какие ингредиенты используются в духах Efirale?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Мы используем только натуральные эфирные масла и ароматические экстракты высшего качества. Все наши духи изготавливаются вручную без синтетических добавок."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Как долго держится аромат натуральных духов?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Стойкость наших натуральных духов составляет от 4 до 8 часов в зависимости от композиции и типа кожи. Древесные и восточные ароматы держатся дольше цитрусовых."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Осуществляете ли вы доставку по Грузии?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Да, мы осуществляем доставку по всей территории Грузии. Доставка в Батуми - бесплатная при заказе от 100 лари, в другие города - от 150 лари."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Можно ли заказать индивидуальный аромат?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Да, мы создаем индивидуальные ароматы на заказ. Вы можете посетить наш шоурум в Батуми для личной консультации с парфюмером."
                    }
                }
            ]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(faqData);
        document.head.appendChild(script);
    }

    // Добавляем микроразметку для продуктов
    function addProductSchema() {
        const products = [
            {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "Grape Water - Натуральные духи",
                "image": "https://efirale.com/images/perfumes/grape_water.jpg",
                "description": "Свежий фруктовый аромат с нотами винограда и цитрусов",
                "brand": {
                    "@type": "Brand",
                    "name": "Efirale"
                },
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "GEL",
                    "price": "120",
                    "availability": "https://schema.org/InStock",
                    "seller": {
                        "@type": "Organization",
                        "name": "Efirale"
                    }
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "42"
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "Clean Home Aroma - Диффузор",
                "image": "https://efirale.com/images/diffusers/clean_home_aroma.JPEG",
                "description": "Ароматизатор для дома с чистым свежим ароматом",
                "brand": {
                    "@type": "Brand",
                    "name": "Efirale"
                },
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "GEL",
                    "price": "85",
                    "availability": "https://schema.org/InStock",
                    "seller": {
                        "@type": "Organization",
                        "name": "Efirale"
                    }
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "31"
                }
            }
        ];

        products.forEach(product => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(product);
            document.head.appendChild(script);
        });
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
        const phoneLinks = document.querySelectorAll('a[href^="tel:"], a:contains("+995")');
        phoneLinks.forEach(link => {
            if (!link.getAttribute('href')?.startsWith('tel:')) {
                const phone = link.textContent.replace(/\D/g, '');
                if (phone) {
                    link.setAttribute('href', `tel:+${phone}`);
                }
            }
        });

        // Email ссылки
        const emailLinks = document.querySelectorAll('a:contains("@")');
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

    // Добавляем мета-теги для соцсетей динамически
    function addSocialMetaTags() {
        const metaTags = [
            { property: 'fb:app_id', content: '' }, // Добавьте ваш Facebook App ID
            { property: 'article:author', content: 'https://facebook.com/efirale' },
            { property: 'article:publisher', content: 'https://facebook.com/efirale' },
            { name: 'pinterest-rich-pin', content: 'true' }
        ];

        metaTags.forEach(tag => {
            if (tag.content) {
                const meta = document.createElement('meta');
                if (tag.property) {
                    meta.setAttribute('property', tag.property);
                } else {
                    meta.setAttribute('name', tag.name);
                }
                meta.setAttribute('content', tag.content);
                document.head.appendChild(meta);
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
        addFAQSchema();
        addProductSchema();
        initLazyLoading();
        optimizeImages();
        optimizeLinks();
        improveAccessibility();
        addSocialMetaTags();
        optimizeScrolling();

        // Добавляем консольное сообщение для отладки
        console.log('✅ SEO улучшения Efirale загружены успешно');
    }

    // Запускаем инициализацию
    init();

})();
