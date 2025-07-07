document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const nome_completo = document.getElementById('nome_completo').value;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    errorMessage.textContent = '';
    successMessage.textContent = '';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email, nome_completo }),
        });

        const data = await response.json();

        if (response.ok) {
            successMessage.textContent = 'Usuário registrado com sucesso! Você pode fazer login agora.';
            // Optionally redirect to login page after a delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } else {
            errorMessage.textContent = data.detail || 'Erro ao registrar usuário.';
        }
    } catch (error) {
        console.error('Erro:', error);
        errorMessage.textContent = 'Erro de conexão. Tente novamente.';
    }
});