let order = [];
    let total = 0;

    // Навигация
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            document.getElementById(targetPage).classList.add('active');
            window.scrollTo(0, 0);
        });
    });

    // Фильтрация меню
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            
            document.querySelectorAll('.menu-item').forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Добавление в заказ
    document.querySelectorAll('.add-to-order').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            
            order.push({ name, price });
            total += price;
            updateOrderDisplay();
        });
    });

    function updateOrderDisplay() {
        const orderItems = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        
        orderItems.innerHTML = '';
        order.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <span>${item.name}</span>
                <span>${item.price} руб.</span>
            `;
            orderItems.appendChild(orderItem);
        });
        
        orderTotal.textContent = total;
    }
// Функция проверки времени работы ресторана
function validateRestaurantHours(dateString, timeString) {
    const date = new Date(dateString);
    const time = timeString.split(':');
    const hours = parseInt(time[0]);
    const dayOfWeek = date.getDay(); // 0 - воскресенье, 6 - суббота
    
    // вс-чт с 11:00 до 23:00
    // пт-сб с 11:00 до 00:00
    if (dayOfWeek >= 0 && dayOfWeek <= 4) { // вс-чт
        if (hours < 11 || hours >= 23) {
            return {
                valid: false,
                message: 'В воскресенье-четверг ресторан работает с 11:00 до 23:00'
            };
        }
    } else if (dayOfWeek === 5 || dayOfWeek === 6) { // пт-сб
        if (hours < 11) {
            return {
                valid: false,
                message: 'В пятницу-субботу ресторан работает с 11:00 до 00:00'
            };
        }
        // В пятницу-субботу можно бронировать до 00:00 (24:00)
    }
    
    return { valid: true };
}

// Функция для получения доступных временных слотов
function getAvailableTimeSlots(dayOfWeek) {
    if (dayOfWeek >= 0 && dayOfWeek <= 4) { // вс-чт
        return ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    } else { // пт-сб
        return ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    }
}

// Обработчик изменения даты
document.getElementById('event-date').addEventListener('change', function() {
    const date = new Date(this.value);
    const dayOfWeek = date.getDay();
    const timeSlots = getAvailableTimeSlots(dayOfWeek);
    
    // Обновляем подсказку в зависимости от дня недели
    const timeHint = document.querySelector('#event-time + small');
    if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        timeHint.textContent = 'Ресторан работает: с 11:00 до 23:00';
    } else {
        timeHint.textContent = 'Ресторан работает: с 11:00 до 00:00';
    }
});

// Измененный обработчик формы бронирования
document.getElementById('reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Форма бронирования обрабатывается...');
    
    // Собираем данные
    const formData = {
        eventType: document.getElementById('event-type').value,
        eventTheme: document.getElementById('event-theme').value,
        eventDate: document.getElementById('event-date').value,
        eventTime: document.getElementById('event-time').value,
        guestsCount: document.getElementById('guests-count').value,
        budget: document.getElementById('budget').value,
        specialRequests: document.getElementById('special-requests').value,
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value
    };
    
    // Проверяем обязательные поля
    if (!formData.eventType || !formData.eventTheme || !formData.eventDate || !formData.eventTime || 
        !formData.guestsCount || !formData.budget || !formData.fullName || !formData.phone || !formData.email) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    // Проверяем время работы ресторана
    const timeValidation = validateRestaurantHours(formData.eventDate, formData.eventTime);
    if (!timeValidation.valid) {
        const date = new Date(formData.eventDate);
        const dayOfWeek = date.getDay();
        const availableSlots = getAvailableTimeSlots(dayOfWeek);
        
        const errorElement = document.getElementById('time-error');
        errorElement.innerHTML = `
            ${timeValidation.message}.<br>
            Доступное время: ${availableSlots.join(', ')}
        `;
        errorElement.style.display = 'block';
        
        // Подсвечиваем поле времени
        document.getElementById('event-time').style.borderColor = '#dc3545';
        return;
    } else {
        // Убираем ошибку если все ок
        document.getElementById('time-error').style.display = 'none';
        document.getElementById('event-time').style.borderColor = '';
    }
    
    console.log('Все поля заполнены, показываем модальное окно');
    
    // Заполняем модальное окно подтверждения
    fillConfirmationModal(formData);
    
    // ПОКАЗЫВАЕМ МОДАЛЬНОЕ ОКНО С ДЕТАЛЯМИ БРОНИРОВАНИЯ
    document.getElementById('confirmation-modal').style.display = 'flex';
});
    // Кнопка перехода к меню из бронирования
    document.getElementById('menuRedirectBtn').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('menu').classList.add('active');
        window.scrollTo(0, 0);
    });

    // Кнопка сохранения заказа в меню
    document.getElementById('save-order').addEventListener('click', function() {
        if (order.length === 0) {
            alert('Ваш заказ пуст. Добавьте блюда из меню.');
            return;
        }
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('booking').classList.add('active');
        window.scrollTo(0, 0);
    });

    

    function fillConfirmationModal(formData) {
        const eventTypeMap = {
            'wedding': 'Свадьба',
            'birthday': 'День рождения',
            'corporate': 'Корпоратив',
            'conference': 'Конференция',
            'other': 'Другое'
        };
        
        const eventThemeMap = {
            'classic': 'Дружеская встреча',
            'modern': 'Праздник',
            'vintage': 'Отдых',
            'rustic': 'Деловая встреча',
            'custom': 'Индивидуальная'
        };
        
        // Заполняем детали мероприятия
        document.getElementById('confirm-event-type').textContent = eventTypeMap[formData.eventType] || formData.eventType;
        document.getElementById('confirm-event-theme').textContent = eventThemeMap[formData.eventTheme] || formData.eventTheme;
        document.getElementById('confirm-event-datetime').textContent = `${formatDate(formData.eventDate)} в ${formData.eventTime}`;
        document.getElementById('confirm-guests-count').textContent = formData.guestsCount;
        document.getElementById('confirm-budget').textContent = parseInt(formData.budget).toLocaleString('ru-RU');
        document.getElementById('confirm-special-requests').textContent = formData.specialRequests || 'Нет особых пожеланий';
        document.getElementById('confirm-contact-person').textContent = formData.fullName;
        document.getElementById('confirm-phone').textContent = formData.phone;
        document.getElementById('confirm-email').textContent = formData.email;
        
        // Заполняем информацию о меню
        const orderItemsContainer = document.getElementById('confirm-order-items');
        const orderTotalElement = document.getElementById('confirm-order-total');
        
        if (order.length > 0) {
            orderItemsContainer.innerHTML = '';
            order.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item-confirm';
                orderItem.innerHTML = `
                    <span>${item.name}</span>
                    <span>${item.price.toLocaleString('ru-RU')} руб.</span>
                `;
                orderItemsContainer.appendChild(orderItem);
            });
            orderTotalElement.textContent = total.toLocaleString('ru-RU');
        } else {
            orderItemsContainer.innerHTML = '<div class="empty-order">Меню не выбрано</div>';
            orderTotalElement.textContent = '0';
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Обработчики модальных окон
    document.getElementById('edit-booking').addEventListener('click', function() {
        // Закрываем модальное окно, остаемся на странице бронирования
        document.getElementById('confirmation-modal').style.display = 'none';
    });

    document.getElementById('confirm-booking').addEventListener('click', function() {
    // Собираем данные формы заново
    const formData = {
        eventType: document.getElementById('event-type').value,
        eventTheme: document.getElementById('event-theme').value,
        eventDate: document.getElementById('event-date').value,
        eventTime: document.getElementById('event-time').value,
        guestsCount: document.getElementById('guests-count').value,
        budget: document.getElementById('budget').value,
        specialRequests: document.getElementById('special-requests').value,
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value
    };
    
    // Отправляем в Telegram
    sendToTelegram(formData).then(success => {
        if (success) {
            console.log('Уведомление отправлено в Telegram!');
        } else {
            console.log('Ошибка отправки в Telegram');
        }
    });
    
    document.getElementById('confirmation-modal').style.display = 'none';
    document.getElementById('success-modal').style.display = 'flex';
});

    document.getElementById('success-ok').addEventListener('click', function() {
        // Закрываем окно успеха и переходим на главную
        document.getElementById('success-modal').style.display = 'none';
        
        // Сбрасываем форму и заказ
        document.getElementById('reservation-form').reset();
        order = [];
        total = 0;
        updateOrderDisplay();
        
        // Переходим на главную страницу
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('home').classList.add('active');
    });

    // Закрытие модальных окон
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('confirmation-modal').style.display = 'none';
    });

    document.querySelector('.close-success-modal').addEventListener('click', function() {
        document.getElementById('success-modal').style.display = 'none';
    });
async function sendToTelegram(bookingData) {
    const TELEGRAM_BOT_TOKEN = '8284830381:AAHBSuNFSTXcrDhInz7vdUCkQyGEcFe41wU';
    const TELEGRAM_CHAT_ID = '1265782640';
    
    // Формируем список блюд
    let menuText = '';
    if (order.length > 0) {
        menuText = '\n🍽️ ВЫБРАННОЕ МЕНЮ:\n';
        order.forEach((item, index) => {
            menuText += `${index + 1}. ${item.name} - ${item.price} руб.\n`;
        });
        menuText += `💰 ОБЩАЯ СУММА: ${total} руб.`;
    } else {
        menuText = '\n🍽️ Меню не выбрано';
    }
    
    const message = `📋 НОВАЯ ЗАЯВКА НА БРОНИРОВАНИЕ\n\n` +
                   `🎉 Тип мероприятия: ${bookingData.eventType}\n` +
                   `🎯 Тематика: ${bookingData.eventTheme}\n` +
                   `📅 Дата: ${bookingData.eventDate}\n` +
                   `⏰ Время: ${bookingData.eventTime}\n` +
                   `👥 Количество гостей: ${bookingData.guestsCount}\n` +
                   `💰 Бюджет: ${bookingData.budget} руб.\n` +
                   `👤 ФИО: ${bookingData.fullName}\n` +
                   `📞 Телефон: ${bookingData.phone}\n` +
                   `📧 Email: ${bookingData.email}\n` +
                   `💼 Компания: ${bookingData.company || 'Не указана'}\n` +
                   `📝 Пожелания: ${bookingData.specialRequests || 'Нет'}` +
                   menuText;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        return false;
    }
}
    // Закрытие по клику вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('confirmation-modal')) {
            document.getElementById('confirmation-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('success-modal')) {
            document.getElementById('success-modal').style.display = 'none';
        }
    });
    // Навигация
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        const eventType = this.getAttribute('data-event-type'); // новый параметр
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        document.getElementById(targetPage).classList.add('active');
        
        // Если переходим на бронирование и указан тип мероприятия
        if (targetPage === 'booking' && eventType) {
            // Устанавливаем выбранный тип мероприятия
            setTimeout(() => {
                document.getElementById('event-type').value = eventType;
            }, 100);
        }
        
        window.scrollTo(0, 0);
    });
});

// История навигации
let historyStack = [];
let currentHistoryIndex = -1;

// Функция для перехода на страницу с сохранением в историю
function navigateToPage(pageId, addToHistory = true) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
    
    if (addToHistory) {
        // Добавляем в историю
        historyStack = historyStack.slice(0, currentHistoryIndex + 1);
        historyStack.push(pageId);
        currentHistoryIndex = historyStack.length - 1;
        
        // Обновляем URL без перезагрузки страницы
        history.pushState({ page: pageId }, '', `#${pageId}`);
    }
}

// Обработчик кнопок навигации
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        const eventType = this.getAttribute('data-event-type');
        
        navigateToPage(targetPage);
        
        // Если переходим на бронирование и указан тип мероприятия
        if (targetPage === 'booking' && eventType) {
            setTimeout(() => {
                document.getElementById('event-type').value = eventType;
            }, 100);
        }
    });
});

// Обработчик кнопок браузера (назад/вперед)
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        navigateToPage(event.state.page, false);
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем главную страницу как начальную
    historyStack.push('home');
    currentHistoryIndex = 0;
    history.replaceState({ page: 'home' }, '', '#home');
    
    // Если в URL уже есть хэш, переходим на указанную страницу
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        navigateToPage(hash, false);
    }
});

// Также обнови функцию перехода к меню и бронированию из заказа
document.getElementById('menuRedirectBtn').addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('menu');
});

document.getElementById('save-order').addEventListener('click', function() {
    if (order.length === 0) {
        alert('Ваш заказ пуст. Добавьте блюда из меню.');
        return;
    }
    navigateToPage('booking');
});

// Мобильное меню
document.getElementById('mobile-menu-toggle').addEventListener('click', function() {
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('active');
});

// Закрываем мобильное меню при выборе пункта
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('main-nav').classList.remove('active');
    });
});