document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. NAVBAR & MENU MOBILE
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Altera o estilo da Navbar ao rolar a página
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

    // Toggle do Menu Mobile
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Fecha o menu mobile ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu?.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle?.classList.remove('active');
                mobileToggle?.setAttribute('aria-expanded', 'false');
            }
        });
    });

    /* ==========================================================================
       2. SCROLL SUAVE PARA LINKS INTERNOS (Com tratamento de erro)
       ========================================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Ignora se for apenas '#' ou vazio
            if (!targetId || targetId === '#') return;

            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const navHeight = navbar ? navbar.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            } catch (err) {
                // Previne crash caso o seletor seja inválido
                console.warn(`Seletor inválido para scroll suave: ${targetId}`);
            }
        });
    });

    /* ==========================================================================
       3. ANIMAÇÕES AO ROLAR (INTERSECTION OBSERVER)
       ========================================================================== */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section, .room-card, .exp-card, .gallery-item').forEach(el => {
        el.classList.add('reveal-init');
        revealObserver.observe(el);
    });

    /* ==========================================================================
       4. GALERIA DE FOTOS
       ========================================================================== */
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(img => {
        img.addEventListener('click', () => {
            // Espaço reservado para ampliação/lightbox futuro
        });
    });

    /* ==========================================================================
       5. FORMULÁRIO DE RESERVA & VALIDAÇÕES (Hotel Velaris)
       ========================================================================== */
    const bookingForm = document.getElementById('reservation-form');

    if (bookingForm) {
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        const submitBtn = bookingForm.querySelector('button[type="submit"]');

        // Formatação precisa da data local (YYYY-MM-DD) sem problemas de fuso horário UTC
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (checkinInput) {
            checkinInput.min = todayStr;
        }

        // Atualiza a data mínima do check-out com base no check-in
        if (checkinInput && checkoutInput) {
            checkinInput.addEventListener('change', () => {
                if (checkinInput.value) {
                    checkoutInput.min = checkinInput.value;
                    if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
                        checkoutInput.value = '';
                    }
                }
            });
        }

        // Evento de Submissão
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            clearFormErrors(bookingForm);
            clearSuccessFeedback();

            let isValid = true;
            const checkinVal = checkinInput ? checkinInput.value : '';
            const checkoutVal = checkoutInput ? checkoutInput.value : '';

            // Validação de Check-in
            if (checkinInput && !checkinVal) {
                showFieldError(checkinInput, 'Selecione a data de check-in.');
                isValid = false;
            } else if (checkinVal && checkinVal < todayStr) {
                showFieldError(checkinInput, 'A data não pode ser anterior a hoje.');
                isValid = false;
            }

            // Validação de Check-out
            if (checkoutInput && !checkoutVal) {
                showFieldError(checkoutInput, 'Selecione a data de check-out.');
                isValid = false;
            } else if (checkinVal && checkoutVal && checkoutVal <= checkinVal) {
                showFieldError(checkoutInput, 'O check-out deve ser posterior ao check-in.');
                isValid = false;
            }

            if (!isValid) return;

            // ESTADO DE CARREGAMENTO NO BOTÃO
            if (submitBtn) {
                const originalBtnContent = submitBtn.innerHTML;

                submitBtn.disabled = true;
                submitBtn.style.cursor = 'wait';
                submitBtn.style.opacity = '0.85';
                submitBtn.innerHTML = `
                    <span style="display: inline-flex; align-items: center; justify-content: center; gap: 10px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spinVelaris 0.8s linear infinite;"></span>
                        Processando reserva...
                    </span>
                `;

                injectSpinnerKeyframes();

                // Simulação de processamento (1.8 segundos)
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.cursor = '';
                    submitBtn.style.opacity = '';
                    submitBtn.innerHTML = originalBtnContent;

                    showSuccessFeedback(bookingForm);
                }, 1800);
            }
        });
    }

    function showFieldError(input, message) {
        const parent = input.parentElement;
        let errorEl = parent.querySelector('.error-message');

        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.style.color = '#E74C3C';
            errorEl.style.fontSize = '0.75rem';
            errorEl.style.marginTop = '6px';
            errorEl.style.display = 'block';
            parent.appendChild(errorEl);
        }

        errorEl.textContent = message;
        input.style.borderColor = '#E74C3C';
    }

    function clearFormErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.form-control, input, select').forEach(input => {
            input.style.borderColor = '';
        });
    }

    function clearSuccessFeedback() {
        const existingSuccess = document.querySelector('.booking-success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
    }

    function showSuccessFeedback(form) {
        clearSuccessFeedback();

        const feedback = document.createElement('div');
        feedback.className = 'booking-success-message';
        feedback.style.gridColumn = '1 / -1';
        feedback.style.width = '100%';
        feedback.style.marginTop = '24px';
        feedback.style.padding = '20px 24px';
        feedback.style.backgroundColor = 'rgba(197, 160, 89, 0.12)';
        feedback.style.border = '1px solid #C5A059';
        feedback.style.borderRadius = '6px';
        feedback.style.textAlign = 'center';
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(10px)';
        feedback.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        feedback.innerHTML = `
            <div style="font-size: 1.5rem; color: #C5A059; margin-bottom: 6px;">✓</div>
            <h4 style="color: #FFF; font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; margin-bottom: 6px; font-weight: 500;">Solicitação Recebida com Sucesso</h4>
            <p style="color: rgba(255, 255, 255, 0.85); font-size: 0.88rem; margin: 0; line-height: 1.5;">
                Obrigado pela sua solicitação. Sua pré-reserva foi registrada. Nossa equipe entrará em contato em breve para confirmar sua estadia.
            </p>
        `;

        form.appendChild(feedback);

        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });
    }

    function injectSpinnerKeyframes() {
        if (!document.getElementById('velaris-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'velaris-spinner-style';
            style.textContent = `
                @keyframes spinVelaris {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
});