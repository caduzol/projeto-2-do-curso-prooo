const CONFIG = {
    selectors: {
        header: '.header',
        menuToggle: '#menuToggle',
        nav: '#nav',
        navLinks: '#nav a',
        contactForm: '#contactForm',
        formMessage: '#formMessage',
        phoneInput: '#telefone',
        faqItems: '.faq-list details',
        animatedElements: [
            '.intro-card',
            '.specialty-card',
            '.doctor-card',
            '.testimonial',
            '.step',
            '.experience-card',
            '.section-content',
            '.image-wrapper',
            '.contact-info',
            '.contact-form'
        ].join(',')
    },

    classes: {
        scrolled: 'header-scrolled',
        menuOpen: 'menu-open',
        visible: 'is-visible',
        loading: 'is-loading',
        success: 'success',
        error: 'error'
    },

    scroll: {
        headerThreshold: 20,
        offset: 80
    },

    form: {
        messageDuration: 6000
    }
};

/*
 * ------------------------------------------------------------
 * ESTADO DA APLICAÇÃO
 * ------------------------------------------------------------
 */

const state = {
    menuOpen: false,
    formSubmitting: false,
    lastScrollPosition: 0
};

/*
 * ------------------------------------------------------------
 * ELEMENTOS
 * ------------------------------------------------------------
 */

const elements = {
    header: document.querySelector(CONFIG.selectors.header),
    menuToggle: document.querySelector(CONFIG.selectors.menuToggle),
    nav: document.querySelector(CONFIG.selectors.nav),
    navLinks: document.querySelectorAll(CONFIG.selectors.navLinks),
    contactForm: document.querySelector(CONFIG.selectors.contactForm),
    formMessage: document.querySelector(CONFIG.selectors.formMessage),
    phoneInput: document.querySelector(CONFIG.selectors.phoneInput),
    faqItems: document.querySelectorAll(CONFIG.selectors.faqItems),
    animatedElements: document.querySelectorAll(
        CONFIG.selectors.animatedElements
    )
};

/*
 * ------------------------------------------------------------
 * UTILITÁRIOS
 * ------------------------------------------------------------
 */

const utils = {

    isElement(element) {
        return element instanceof HTMLElement;
    },

    isInput(element) {
        return (
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement ||
            element instanceof HTMLSelectElement
        );
    },

    scrollBehavior() {
        return window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
            ? 'auto'
            : 'smooth';
    },

    getHeaderOffset() {
        if (!elements.header) {
            return CONFIG.scroll.offset;
        }

        return elements.header.offsetHeight + 10;
    },

    cleanText(value) {
        return String(value || '')
            .trim()
            .replace(/\s+/g, ' ');
    },

    removeAccents(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    },

    debounce(callback, delay = 150) {
        let timeout;

        return (...args) => {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    },

    announce(message) {
        const liveRegion = document.createElement('div');

        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');

        liveRegion.style.position = 'absolute';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.padding = '0';
        liveRegion.style.margin = '-1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clip = 'rect(0, 0, 0, 0)';
        liveRegion.style.whiteSpace = 'nowrap';
        liveRegion.style.border = '0';

        liveRegion.textContent = message;

        document.body.appendChild(liveRegion);

        setTimeout(() => {
            liveRegion.remove();
        }, 1000);
    }
};

/*
 * ------------------------------------------------------------
 * MENU MOBILE
 * ------------------------------------------------------------
 */

const mobileMenu = {

    init() {
        if (!elements.menuToggle || !elements.nav) {
            return;
        }

        elements.menuToggle.addEventListener(
            'click',
            () => this.toggle()
        );

        elements.navLinks.forEach(link => {
            link.addEventListener(
                'click',
                event => this.handleLinkClick(event)
            );
        });

        document.addEventListener(
            'click',
            event => this.handleOutsideClick(event)
        );

        document.addEventListener(
            'keydown',
            event => this.handleKeyboard(event)
        );

        window.addEventListener(
            'resize',
            utils.debounce(() => this.handleResize(), 150)
        );

        this.updateAccessibility();
    },

    toggle() {
        if (state.menuOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        if (!elements.nav || !elements.menuToggle) {
            return;
        }

        state.menuOpen = true;

        elements.nav.classList.add(CONFIG.classes.menuOpen);
        elements.menuToggle.classList.add(CONFIG.classes.menuOpen);

        elements.menuToggle.setAttribute(
            'aria-expanded',
            'true'
        );

        elements.menuToggle.setAttribute(
            'aria-label',
            'Fechar menu'
        );

        document.body.classList.add('menu-is-open');

        utils.announce('Menu aberto');
    },

    close() {
        if (!elements.nav || !elements.menuToggle) {
            return;
        }

        state.menuOpen = false;

        elements.nav.classList.remove(CONFIG.classes.menuOpen);
        elements.menuToggle.classList.remove(CONFIG.classes.menuOpen);

        elements.menuToggle.setAttribute(
            'aria-expanded',
            'false'
        );

        elements.menuToggle.setAttribute(
            'aria-label',
            'Abrir menu'
        );

        document.body.classList.remove('menu-is-open');

        utils.announce('Menu fechado');
    },

    handleLinkClick(event) {
        const link = event.currentTarget;

        if (!utils.isElement(link)) {
            return;
        }

        const href = link.getAttribute('href');

        if (!href) {
            return;
        }

        /*
         * Links internos da página.
         */
        if (href.startsWith('#')) {
            const target = document.querySelector(href);

            if (target) {
                event.preventDefault();

                this.close();

                navigation.scrollToElement(target);

                /*
                 * Atualiza a URL sem recarregar a página.
                 */
                if (history.pushState) {
                    history.pushState(null, '', href);
                }
            }

            return;
        }

        /*
         * Links externos ou outras páginas.
         */
        this.close();
    },

    handleOutsideClick(event) {
        if (!state.menuOpen) {
            return;
        }

        const clickedInsideNav =
            elements.nav?.contains(event.target);

        const clickedToggle =
            elements.menuToggle?.contains(event.target);

        if (!clickedInsideNav && !clickedToggle) {
            this.close();
        }
    },

    handleKeyboard(event) {
        if (event.key === 'Escape' && state.menuOpen) {
            this.close();
            elements.menuToggle?.focus();
        }
    },

    handleResize() {
        /*
         * Evita que o menu permaneça aberto ao mudar
         * de mobile para desktop.
         */
        if (window.innerWidth > 768 && state.menuOpen) {
            this.close();
        }
    },

    updateAccessibility() {
        if (!elements.menuToggle) {
            return;
        }

        if (!elements.menuToggle.hasAttribute('aria-expanded')) {
            elements.menuToggle.setAttribute(
                'aria-expanded',
                'false'
            );
        }

        elements.menuToggle.setAttribute(
            'aria-controls',
            'nav'
        );
    }
};

/*
 * ------------------------------------------------------------
 * NAVEGAÇÃO
 * ------------------------------------------------------------
 */

const navigation = {

    init() {
        document.addEventListener(
            'click',
            event => this.handleAnchor(event)
        );
    },

    handleAnchor(event) {
        const link = event.target.closest('a[href^="#"]');

        if (!link) {
            return;
        }

        const href = link.getAttribute('href');

        if (!href || href === '#') {
            return;
        }

        let target;

        try {
            target = document.querySelector(href);
        } catch {
            return;
        }

        if (!target) {
            return;
        }

        event.preventDefault();

        mobileMenu.close();

        this.scrollToElement(target);

        if (history.pushState) {
            history.pushState(null, '', href);
        }
    },

    scrollToElement(element) {
        if (!utils.isElement(element)) {
            return;
        }

        const offset = utils.getHeaderOffset();

        const targetPosition =
            element.getBoundingClientRect().top +
            window.pageYOffset -
            offset;

        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: utils.scrollBehavior()
        });
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: utils.scrollBehavior()
        });
    },

    handleInitialHash() {
        const hash = window.location.hash;

        if (!hash || hash === '#') {
            return;
        }

        let target;

        try {
            target = document.querySelector(hash);
        } catch {
            return;
        }

        if (!target) {
            return;
        }

        /*
         * Aguarda o carregamento inicial da página.
         */
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.scrollToElement(target);
            }, 100);
        });
    }
};

/*
 * ------------------------------------------------------------
 * HEADER AO ROLAR
 * ------------------------------------------------------------
 */

const headerController = {

    init() {
        if (!elements.header) {
            return;
        }

        this.update();

        window.addEventListener(
            'scroll',
            utils.debounce(() => this.update(), 10),
            { passive: true }
        );
    },

    update() {
        if (!elements.header) {
            return;
        }

        const currentScroll = window.pageYOffset;

        if (currentScroll > CONFIG.scroll.headerThreshold) {
            elements.header.classList.add(
                CONFIG.classes.scrolled
            );
        } else {
            elements.header.classList.remove(
                CONFIG.classes.scrolled
            );
        }

        state.lastScrollPosition = currentScroll;
    }
};

/*
 * ------------------------------------------------------------
 * FAQ
 * ------------------------------------------------------------
 */

const faq = {

    init() {
        if (!elements.faqItems.length) {
            return;
        }

        elements.faqItems.forEach(item => {
            this.prepareItem(item);

            item.addEventListener(
                'toggle',
                () => this.handleToggle(item)
            );
        });
    },

    prepareItem(item) {
        if (!item) {
            return;
        }

        const summary = item.querySelector('summary');

        if (!summary) {
            return;
        }

        /*
         * O navegador já controla aria-expanded em alguns
         * contextos, mas fazemos o controle explicitamente
         * para manter o comportamento consistente.
         */
        summary.setAttribute(
            'aria-expanded',
            item.open ? 'true' : 'false'
        );
    },

    handleToggle(item) {
        const summary = item.querySelector('summary');

        if (!summary) {
            return;
        }

        summary.setAttribute(
            'aria-expanded',
            item.open ? 'true' : 'false'
        );

        /*
         * Permite somente uma pergunta aberta por vez.
         */
        if (item.open) {
            elements.faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.open) {
                    otherItem.open = false;
                }
            });
        }
    }
};

/*
 * ------------------------------------------------------------
 * MÁSCARA DE TELEFONE
 * ------------------------------------------------------------
 */

const phoneMask = {

    init() {
        if (!elements.phoneInput) {
            return;
        }

        elements.phoneInput.addEventListener(
            'input',
            event => this.format(event.target)
        );

        elements.phoneInput.addEventListener(
            'blur',
            event => this.format(event.target)
        );
    },

    format(input) {
        if (!input) {
            return;
        }

        let value = input.value.replace(/\D/g, '');

        /*
         * Limita a quantidade de números para telefones
         * brasileiros convencionais.
         */
        value = value.substring(0, 11);

        if (value.length === 0) {
            input.value = '';
            return;
        }

        if (value.length <= 2) {
            input.value = `(${value}`;
            return;
        }

        if (value.length <= 6) {
            input.value =
                `(${value.substring(0, 2)}) ` +
                value.substring(2);
            return;
        }

        /*
         * Celular: (00) 00000-0000
         */
        if (value.length >= 11) {
            input.value =
                `(${value.substring(0, 2)}) ` +
                `${value.substring(2, 7)}-` +
                value.substring(7, 11);

            return;
        }

        /*
         * Telefone fixo incompleto:
         * (00) 0000-0000
         */
        input.value =
            `(${value.substring(0, 2)}) ` +
            `${value.substring(2, 6)}-` +
            value.substring(6);
    },

    getDigits(value) {
        return String(value || '').replace(/\D/g, '');
    }
};

/*
 * ------------------------------------------------------------
 * VALIDAÇÃO DO FORMULÁRIO
 * ------------------------------------------------------------
 */

const formValidator = {

    validate(form) {
        if (!form) {
            return {
                valid: false,
                errors: []
            };
        }

        const errors = [];

        const nome = form.querySelector('#nome');
        const telefone = form.querySelector('#telefone');
        const email = form.querySelector('#email');
        const assunto = form.querySelector('#assunto');
        const mensagem = form.querySelector('#mensagem');

        /*
         * Nome
         */
        if (nome) {
            const nomeValue = utils.cleanText(nome.value);

            if (!nomeValue) {
                errors.push({
                    field: nome,
                    message: 'Digite seu nome.'
                });
            } else if (nomeValue.length < 2) {
                errors.push({
                    field: nome,
                    message: 'Digite um nome válido.'
                });
            }
        }

        /*
         * Telefone
         */
        if (telefone) {
            const digits = phoneMask.getDigits(
                telefone.value
            );

            if (!digits) {
                errors.push({
                    field: telefone,
                    message: 'Digite seu telefone.'
                });
            } else if (
                digits.length !== 10 &&
                digits.length !== 11
            ) {
                errors.push({
                    field: telefone,
                    message: 'Digite um telefone válido.'
                });
            }
        }

        /*
         * E-mail
         */
        if (email) {
            const emailValue =
                utils.cleanText(email.value);

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

            if (!emailValue) {
                errors.push({
                    field: email,
                    message: 'Digite seu e-mail.'
                });
            } else if (!emailRegex.test(emailValue)) {
                errors.push({
                    field: email,
                    message: 'Digite um e-mail válido.'
                });
            }
        }

        /*
         * Assunto
         */
        if (assunto) {
            if (!utils.cleanText(assunto.value)) {
                errors.push({
                    field: assunto,
                    message: 'Selecione uma opção.'
                });
            }
        }

        /*
         * Mensagem
         */
        if (mensagem) {
            const mensagemValue =
                utils.cleanText(mensagem.value);

            /*
             * A mensagem não está marcada como required
             * no HTML, então não obrigamos o preenchimento.
             */
            if (mensagemValue.length > 2000) {
                errors.push({
                    field: mensagem,
                    message:
                        'A mensagem deve ter no máximo 2000 caracteres.'
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    clearErrors(form) {
        if (!form) {
            return;
        }

        form.querySelectorAll(
            '.field-error'
        ).forEach(element => {
            element.classList.remove('field-error');
        });

        form.querySelectorAll(
            '[aria-invalid="true"]'
        ).forEach(element => {
            element.removeAttribute('aria-invalid');
        });
    },

    showErrors(result) {
        if (!result || !result.errors.length) {
            return;
        }

        result.errors.forEach(error => {
            if (!error.field) {
                return;
            }

            error.field.classList.add(
                'field-error'
            );

            error.field.setAttribute(
                'aria-invalid',
                'true'
            );
        });

        const firstError = result.errors[0];

        if (firstError.field) {
            firstError.field.focus({
                preventScroll: true
            });
        }

        formController.showMessage(
            result.errors[0].message,
            CONFIG.classes.error
        );
    }
};

/*
 * ------------------------------------------------------------
 * FORMULÁRIO
 * ------------------------------------------------------------
 */

const formController = {

    init() {
        if (!elements.contactForm) {
            return;
        }

        elements.contactForm.addEventListener(
            'submit',
            event => this.handleSubmit(event)
        );

        /*
         * Remove estado de erro assim que o usuário
         * começa a corrigir o campo.
         */
        elements.contactForm
            .querySelectorAll('input, select, textarea')
            .forEach(field => {
                field.addEventListener(
                    'input',
                    () => this.clearFieldError(field)
                );

                field.addEventListener(
                    'change',
                    () => this.clearFieldError(field)
                );
            });
    },

    async handleSubmit(event) {
        event.preventDefault();

        if (state.formSubmitting) {
            return;
        }

        const form = event.currentTarget;

        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        formValidator.clearErrors(form);

        const validation =
            formValidator.validate(form);

        if (!validation.valid) {
            formValidator.showErrors(validation);
            return;
        }

        await this.submit(form);
    },

    async submit(form) {
        if (!form || state.formSubmitting) {
            return;
        }

        state.formSubmitting = true;

        const button = form.querySelector(
            'button[type="submit"]'
        );

        const originalText = button
            ? button.textContent
            : '';

        this.setLoading(true);

        try {
            /*
             * ------------------------------------------------
             * IMPORTANTE:
             *
             * Este código NÃO envia os dados para um servidor
             * porque o HTML fornecido não possui uma API/backend.
             *
             * Aqui simulamos o processamento para que a interface
             * funcione corretamente.
             *
             * Quando você tiver um backend, substitua o bloco
             * abaixo por fetch() para sua API.
             * ------------------------------------------------
             */

            await this.fakeRequest();

            this.showMessage(
                'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.',
                CONFIG.classes.success
            );

            utils.announce(
                'Mensagem enviada com sucesso.'
            );

            form.reset();

        } catch (error) {
            console.error(
                'Erro ao processar formulário:',
                error
            );

            this.showMessage(
                'Não foi possível enviar sua solicitação. Tente novamente.',
                CONFIG.classes.error
            );

        } finally {
            state.formSubmitting = false;

            this.setLoading(
                false,
                button,
                originalText
            );
        }
    },

    fakeRequest() {
        return new Promise(resolve => {
            setTimeout(resolve, 800);
        });
    },

    setLoading(
        loading,
        button = null,
        originalText = ''
    ) {
        const submitButton =
            button ||
            elements.contactForm?.querySelector(
                'button[type="submit"]'
            );

        if (!submitButton) {
            return;
        }

        if (loading) {
            submitButton.disabled = true;

            submitButton.classList.add(
                CONFIG.classes.loading
            );

            submitButton.setAttribute(
                'aria-busy',
                'true'
            );

            submitButton.dataset.originalText =
                submitButton.textContent;

            submitButton.textContent =
                'Enviando...';

        } else {
            submitButton.disabled = false;

            submitButton.classList.remove(
                CONFIG.classes.loading
            );

            submitButton.removeAttribute(
                'aria-busy'
            );

            submitButton.textContent =
                originalText ||
                submitButton.dataset.originalText ||
                'Solicitar contato';

            delete submitButton.dataset.originalText;
        }
    },

    showMessage(message, type = '') {
        if (!elements.formMessage) {
            return;
        }

        elements.formMessage.textContent = message;

        elements.formMessage.className =
            'form-message';

        if (type) {
            elements.formMessage.classList.add(type);
        }

        elements.formMessage.setAttribute(
            'role',
            type === CONFIG.classes.error
                ? 'alert'
                : 'status'
        );

        clearTimeout(
            elements.formMessage._hideTimeout
        );

        if (message) {
            elements.formMessage._hideTimeout =
                setTimeout(() => {
                    elements.formMessage.textContent = '';

                    elements.formMessage.className =
                        'form-message';

                    elements.formMessage.removeAttribute(
                        'role'
                    );
                }, CONFIG.form.messageDuration);
        }
    },

    clearFieldError(field) {
        if (!field) {
            return;
        }

        field.classList.remove(
            'field-error'
        );

        field.removeAttribute(
            'aria-invalid'
        );
    }
};

/*
 * ------------------------------------------------------------
 * ANIMAÇÕES AO ENTRAR NA TELA
 * ------------------------------------------------------------
 */

const animations = {

    observer: null,

    init() {
        if (
            !elements.animatedElements.length ||
            !('IntersectionObserver' in window)
        ) {
            /*
             * Se IntersectionObserver não existir,
             * simplesmente mostra os elementos.
             */
            elements.animatedElements.forEach(
                element => {
                    element.classList.add(
                        CONFIG.classes.visible
                    );
                }
            );

            return;
        }

        /*
         * Respeita usuários que preferem reduzir animações.
         */
        if (
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches
        ) {
            elements.animatedElements.forEach(
                element => {
                    element.classList.add(
                        CONFIG.classes.visible
                    );
                }
            );

            return;
        }

        this.observer =
            new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            CONFIG.classes.visible
                        );

                        this.observer?.unobserve(
                            entry.target
                        );
                    });
                },
                {
                    threshold: 0.12,
                    rootMargin: '0px 0px -40px 0px'
                }
            );

        elements.animatedElements.forEach(
            element => {
                this.observer.observe(element);
            }
        );
    }
};

/*
 * ------------------------------------------------------------
 * ACTIVE LINK DA NAVEGAÇÃO
 * ------------------------------------------------------------
 */

const activeNavigation = {

    init() {
        const sections = document.querySelectorAll(
            'main section[id]'
        );

        if (
            !sections.length ||
            !('IntersectionObserver' in window)
        ) {
            return;
        }

        const links = Array.from(
            elements.navLinks
        ).filter(link => {
            const href =
                link.getAttribute('href');

            return href?.startsWith('#');
        });

        const observer =
            new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        const id =
                            entry.target.id;

                        links.forEach(link => {
                            const href =
                                link.getAttribute(
                                    'href'
                                );

                            link.classList.toggle(
                                'active',
                                href === `#${id}`
                            );
                        });
                    });
                },
                {
                    threshold: 0.25,
                    rootMargin:
                        '-20% 0px -60% 0px'
                }
            );

        sections.forEach(section => {
            observer.observe(section);
        });
    }
};

/*
 * ------------------------------------------------------------
 * LINK "BACK TO TOP" / LOGO
 * ------------------------------------------------------------
 */

const logoController = {

    init() {
        const logoLinks =
            document.querySelectorAll(
                'a[href="#inicio"]'
            );

        logoLinks.forEach(link => {
            link.addEventListener(
                'click',
                event => {
                    const target =
                        document.querySelector(
                            '#inicio'
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    mobileMenu.close();

                    navigation.scrollToElement(
                        target
                    );

                    if (history.pushState) {
                        history.pushState(
                            null,
                            '',
                            '#inicio'
                        );
                    }
                }
            );
        });
    }
};

/*
 * ------------------------------------------------------------
 * MELHORIAS DE ACESSIBILIDADE
 * ------------------------------------------------------------
 */

const accessibility = {

    init() {
        this.prepareExternalButtons();
        this.prepareImages();
        this.prepareFormLabels();
    },

    prepareExternalButtons() {
        if (!elements.menuToggle) {
            return;
        }

        /*
         * Evita comportamento inesperado de botões sem
         * tipo definido.
         */
        if (
            elements.menuToggle.tagName === 'BUTTON' &&
            !elements.menuToggle.hasAttribute('type')
        ) {
            elements.menuToggle.setAttribute(
                'type',
                'button'
            );
        }
    },

    prepareImages() {
        document
            .querySelectorAll('img')
            .forEach(image => {
                /*
                 * Lazy loading apenas para imagens que
                 * não estejam imediatamente visíveis.
                 */
                if (
                    !image.hasAttribute('loading') &&
                    !image.closest('.hero')
                ) {
                    image.setAttribute(
                        'loading',
                        'lazy'
                    );
                }

                if (
                    !image.hasAttribute('decoding')
                ) {
                    image.setAttribute(
                        'decoding',
                        'async'
                    );
                }
            });
    },

    prepareFormLabels() {
        /*
         * Os campos do HTML já possuem labels corretamente
         * associados por "for", então não precisamos
         * alterar a estrutura.
         */
        if (!elements.contactForm) {
            return;
        }

        elements.contactForm
            .querySelectorAll(
                'input, select, textarea'
            )
            .forEach(field => {
                if (
                    field.required &&
                    !field.hasAttribute(
                        'aria-required'
                    )
                ) {
                    field.setAttribute(
                        'aria-required',
                        'true'
                    );
                }
            });
    }
};

/*
 * ------------------------------------------------------------
 * PREVENÇÃO DE SUBMISSÃO ACIDENTAL COM ENTER
 * ------------------------------------------------------------
 */

const formKeyboard = {

    init() {
        if (!elements.contactForm) {
            return;
        }

        elements.contactForm.addEventListener(
            'keydown',
            event => {
                /*
                 * Não bloqueamos Enter em textarea.
                 */
                if (
                    event.key !== 'Enter' ||
                    event.target instanceof HTMLTextAreaElement
                ) {
                    return;
                }

                /*
                 * Inputs podem continuar submetendo
                 * normalmente.
                 */
            }
        );
    }
};

/*
 * ------------------------------------------------------------
 * TRATAMENTO DE ERROS GERAIS
 * ------------------------------------------------------------
 */

const globalHandlers = {

    init() {
        window.addEventListener(
            'error',
            event => {
                /*
                 * Apenas registra erros inesperados.
                 * Não interrompe a experiência do usuário.
                 */
                console.error(
                    'Erro JavaScript:',
                    event.error || event.message
                );
            }
        );

        window.addEventListener(
            'unhandledrejection',
            event => {
                console.error(
                    'Promise rejeitada:',
                    event.reason
                );
            }
        );
    }
};

/*
 * ------------------------------------------------------------
 * INICIALIZAÇÃO
 * ------------------------------------------------------------
 */

const app = {

    init() {
        mobileMenu.init();
        navigation.init();
        headerController.init();
        faq.init();
        phoneMask.init();
        formController.init();
        animations.init();
        activeNavigation.init();
        logoController.init();
        accessibility.init();
        formKeyboard.init();
        globalHandlers.init();

        navigation.handleInitialHash();

        console.info(
            'Serena Psicologia — JavaScript inicializado.'
        );
    }
};

/*
 * ------------------------------------------------------------
 * START
 * ------------------------------------------------------------
 */

if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        () => app.init(),
        { once: true }
    );
} else {
    app.init();
}

