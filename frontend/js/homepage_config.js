document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('homepageConfigForm');
    let homepageSettingsId = null;

    // Funções para adicionar itens dinâmicos
    window.addFeatureItem = () => {
        const container = document.getElementById('about_features_container');
        const index = container.children.length;
        const div = document.createElement('div');
        div.classList.add('form-row');
        div.innerHTML = `
            <div class="form-group">
                <label>Ícone</label>
                <input type="text" name="about_features[${index}][icon]">
            </div>
            <div class="form-group">
                <label>Texto</label>
                <input type="text" name="about_features[${index}][text]">
            </div>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentNode.remove()">Remover</button>
        `;
        container.appendChild(div);
    };

    window.addServiceCard = () => {
        const container = document.getElementById('services_cards_container');
        const index = container.children.length;
        const div = document.createElement('div');
        div.classList.add('form-section');
        div.innerHTML = `
            <div class="form-group">
                <label>Ícone</label>
                <input type="text" name="services_cards[${index}][icon]">
            </div>
            <div class="form-group">
                <label>Título</label>
                <input type="text" name="services_cards[${index}][title]">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea name="services_cards[${index}][description]" rows="3"></textarea>
            </div>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentNode.remove()">Remover Card</button>
        `;
        container.appendChild(div);
    };

    window.addTestimonialCard = () => {
        const container = document.getElementById('testimonials_cards_container');
        const index = container.children.length;
        const div = document.createElement('div');
        div.classList.add('form-section');
        div.innerHTML = `
            <div class="form-group">
                <label>Texto</label>
                <textarea name="testimonials_cards[${index}][text]" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Autor</label>
                <input type="text" name="testimonials_cards[${index}][author]">
            </div>
            <div class="form-group">
                <label>Avaliação (1-5)</label>
                <input type="number" name="testimonials_cards[${index}][rating]" min="1" max="5">
            </div>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentNode.remove()">Remover Card</button>
        `;
        container.appendChild(div);
    };

    window.addContactInfoItem = () => {
        const container = document.getElementById('contact_info_items_container');
        const index = container.children.length;
        const div = document.createElement('div');
        div.classList.add('form-section');
        div.innerHTML = `
            <div class="form-group">
                <label>Ícone</label>
                <input type="text" name="contact_info_items[${index}][icon]">
            </div>
            <div class="form-group">
                <label>Título</label>
                <input type="text" name="contact_info_items[${index}][title]">
            </div>
            <div class="form-group">
                <label>Conteúdo</label>
                <textarea name="contact_info_items[${index}][content]" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Link (Opcional)</label>
                <input type="url" name="contact_info_items[${index}][link]">
            </div>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.parentNode.remove()">Remover Item</button>
        `;
        container.appendChild(div);
    };

    // Carregar configurações existentes
    try {
        const settings = await apiRequest('/homepage_settings');
        homepageSettingsId = settings.objectId;
        for (const key in settings) {
            const element = document.getElementById(key);
            if (element) {
                if (typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
                    // Handle nested objects if any, though current model doesn't have them directly
                } else if (Array.isArray(settings[key])) {
                    // Handle arrays (features, services, testimonials, contact info)
                    settings[key].forEach(item => {
                        if (key === 'about_features') {
                            addFeatureItem();
                            const lastItem = document.getElementById('about_features_container').lastChild;
                            lastItem.querySelector('input[name$="[icon]"]').value = item.icon;
                            lastItem.querySelector('input[name$="[text]"]').value = item.text;
                        } else if (key === 'services_cards') {
                            addServiceCard();
                            const lastItem = document.getElementById('services_cards_container').lastChild;
                            lastItem.querySelector('input[name$="[icon]"]').value = item.icon;
                            lastItem.querySelector('input[name$="[title]"]').value = item.title;
                            lastItem.querySelector('textarea[name$="[description]"]').value = item.description;
                        } else if (key === 'testimonials_cards') {
                            addTestimonialCard();
                            const lastItem = document.getElementById('testimonials_cards_container').lastChild;
                            lastItem.querySelector('textarea[name$="[text]"]').value = item.text;
                            lastItem.querySelector('input[name$="[author]"]').value = item.author;
                            lastItem.querySelector('input[name$="[rating]"]').value = item.rating;
                        } else if (key === 'contact_info_items') {
                            addContactInfoItem();
                            const lastItem = document.getElementById('contact_info_items_container').lastChild;
                            lastItem.querySelector('input[name$="[icon]"]').value = item.icon;
                            lastItem.querySelector('input[name$="[title]"]').value = item.title;
                            lastItem.querySelector('textarea[name$="[content]"]').value = item.content;
                            if (item.link) lastItem.querySelector('input[name$="[link]"]').value = item.link;
                        }
                    });
                } else {
                    element.value = settings[key];
                }
            }
        }
    } catch (error) {
        console.error('Erro ao carregar configurações da homepage:', error);
        // Se não houver configurações, o formulário ficará vazio para criação
    }

    // Salvar configurações
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {};

        // Processar campos simples
        for (const [key, value] of formData.entries()) {
            if (!key.includes('[')) {
                data[key] = value;
            }
        }

        // Processar arrays (features, services, testimonials, contact info)
        const processArray = (prefix, containerId) => {
            const items = [];
            const container = document.getElementById(containerId);
            Array.from(container.children).forEach(child => {
                const item = {};
                Array.from(child.querySelectorAll('input, textarea')).forEach(input => {
                    const name = input.name;
                    const field = name.substring(name.lastIndexOf('[') + 1, name.lastIndexOf(']'));
                    item[field] = input.value;
                });
                items.push(item);
            });
            data[prefix] = items;
        };

        processArray('about_features', 'about_features_container');
        processArray('services_cards', 'services_cards_container');
        processArray('testimonials_cards', 'testimonials_cards_container');
        processArray('contact_info_items', 'contact_info_items_container');

        try {
            await apiRequest('/homepage_settings', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            alert('Configurações da homepage salvas com sucesso!');
        } catch (error) {
            alert('Erro ao salvar configurações: ' + error.message);
            console.error('Erro ao salvar configurações:', error);
        }
    });
});