document.addEventListener('DOMContentLoaded', async () => {
    try {
        const settings = await apiRequest('/homepage_settings');

        // Hero Section
        document.querySelector('.hero-text h2').textContent = settings.hero_title;
        document.querySelector('.hero-text .subtitle').textContent = settings.hero_subtitle;
        document.querySelector('.hero-text p').textContent = settings.hero_text;
        document.querySelector('.hero-image img').src = settings.hero_image_url;
        document.querySelector('.hero-buttons .btn-primary').href = settings.hero_cta_contact_link;
        document.querySelector('.hero-buttons .btn-secondary').href = settings.hero_cta_services_link;

        // About Section
        document.querySelector('#about .section-title').textContent = settings.about_title;
        document.querySelector('#about .section-subtitle').textContent = settings.about_subtitle;
        document.querySelector('.about-image img').src = settings.about_image_url;
        document.querySelector('.about-text h3').textContent = settings.about_text_1; // Assuming this is the main heading
        document.querySelector('.about-text p:nth-of-type(1)').textContent = settings.about_text_1; // First paragraph
        document.querySelector('.about-text p:nth-of-type(2)').textContent = settings.about_text_2; // Second paragraph

        const aboutFeaturesContainer = document.querySelector('.about-features');
        aboutFeaturesContainer.innerHTML = '';
        settings.about_features.forEach(feature => {
            const div = document.createElement('div');
            div.classList.add('feature-item');
            div.innerHTML = `
                <div class="feature-icon">${feature.icon}</div>
                <span>${feature.text}</span>
            `;
            aboutFeaturesContainer.appendChild(div);
        });

        // Services Section
        document.querySelector('#services .section-title').textContent = settings.services_title;
        document.querySelector('#services .section-subtitle').textContent = settings.services_subtitle;
        const servicesGrid = document.querySelector('.services-grid');
        servicesGrid.innerHTML = '';
        settings.services_cards.forEach(card => {
            const div = document.createElement('div');
            div.classList.add('service-card');
            div.innerHTML = `
                <div class="service-icon">${card.icon}</div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
            `;
            servicesGrid.appendChild(div);
        });

        // Testimonials Section
        document.querySelector('#testimonials .section-title').textContent = settings.testimonials_title;
        document.querySelector('#testimonials .section-subtitle').textContent = settings.testimonials_subtitle;
        const testimonialsGrid = document.querySelector('.testimonials-grid');
        testimonialsGrid.innerHTML = '';
        settings.testimonials_cards.forEach(card => {
            const div = document.createElement('div');
            div.classList.add('testimonial-card');
            div.innerHTML = `
                <p class="testimonial-text">${card.text}</p>
                <p class="testimonial-author">${card.author}</p>
                <div class="testimonial-rating">${'⭐'.repeat(card.rating)}</div>
            `;
            testimonialsGrid.appendChild(div);
        });

        // CTA Section
        document.querySelector('.cta h2').textContent = settings.cta_title;
        document.querySelector('.cta p').textContent = settings.cta_text;
        document.querySelector('.cta-buttons .btn-white:nth-of-type(1)').href = settings.cta_whatsapp_link;
        document.querySelector('.cta-buttons .btn-white:nth-of-type(2)').href = settings.cta_all_links;

        // Contact Section
        document.querySelector('#contact .section-title').textContent = settings.contact_title;
        document.querySelector('#contact .section-subtitle').textContent = settings.contact_subtitle;
        const contactGrid = document.querySelector('.contact-grid');
        contactGrid.innerHTML = ''; // Clear existing static content
        settings.contact_info_items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('contact-info');
            div.innerHTML = `
                <div class="contact-icon">${item.icon}</div>
                <h3>${item.title}</h3>
                <p>${item.content}</p>
                ${item.link ? `<p><a href="${item.link}">${item.link.replace('https://wa.me/', '').replace('mailto:', '')}</a></p>` : ''}
            `;
            contactGrid.appendChild(div);
        });
        // Add map container back
        const mapDiv = document.createElement('div');
        mapDiv.classList.add('map-container');
        mapDiv.innerHTML = `<iframe src="${settings.contact_map_embed_url}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        contactGrid.appendChild(mapDiv);

        // Footer
        document.querySelector('.social-links a:nth-of-type(1)').href = settings.footer_social_instagram;
        document.querySelector('.social-links a:nth-of-type(2)').href = settings.footer_social_facebook;
        document.querySelector('.social-links a:nth-of-type(3)').href = settings.footer_social_whatsapp;
        document.querySelector('.social-links a:nth-of-type(4)').href = settings.footer_social_all_links;
        document.querySelector('.footer p:nth-of-type(1)').textContent = settings.footer_copyright;
        document.querySelector('.footer p:nth-of-type(2)').textContent = settings.footer_developer_text;

    } catch (error) {
        console.error('Erro ao carregar configurações da homepage:', error);
        // Exibir uma mensagem de erro ou conteúdo padrão
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

mobileMenuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('active');
});