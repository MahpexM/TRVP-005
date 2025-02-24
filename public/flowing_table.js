// Скрипт для работы всплывающей таблицы по кнопке
import DestinationAndFerry from './flight_add_choose.js';
import funcsAPI from './table_reactor.js';

// Получаем элементы
const modal = document.getElementById('modal');
const openModalButton = document.getElementById('view-list-of-destinations');
const closeModalButton = document.getElementById('closeModal');

// Открытие модального окна
openModalButton.onclick = async function() {
	//let destinations = await DestinationAndFerry();
	// надо получить поля "пункты назначения"
	//console.log(destinations);
	try {
		var pre_uniqueDestinations = await funcsAPI.UniqueDestinationsGet();
		var uniqueDestinations = pre_uniqueDestinations.rows;
		console.log(uniqueDestinations.rows);
		const destinationsList = document.getElementById('existing-destinations');
		
		// Очищаем текущее содержимое таблицы
		destinationsList.innerHTML = '';

		// Заполняем таблицу новыми данными
		uniqueDestinations.forEach(destinations => {
			const row = document.createElement('tr');
			
			// Заполняем ячейки
			row.innerHTML = `
				<td>${destinations.destination}</td>
			`;

			// Добавляем строку в таблицу
			destinationsList.appendChild(row);
		});
		
		modal.style.display = 'block';
		
	} catch (error) {
		console.error('Ошибка при получении уникальных пунктов назначения:', error);
	}
}

// Закрытие модального окна
closeModalButton.onclick = function() {
	modal.style.display = 'none';
}

// Убираем модальное окно при клике вне его
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = 'none';
	}
}
