import funcsAPI from './table_reactor.js';

import DestinationAndFerry from './flight_add_choose.js';

document.addEventListener('DOMContentLoaded', async () => {
    const flightList = document.getElementById('flight-list');
    const flightForm = document.getElementById('flight-edit-form');
    const flightIdInput = document.getElementById('flight-id');
    const formTitle = document.getElementById('form-title');
    const addFlightBtn = document.getElementById('add-flight-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const notification = document.getElementById('notification');
	const addCargoButton = document.getElementById('add-cargo-btn');
	const deleteCargoButton = document.getElementById('delete-cargo-btn');
		
    let flights = [];										// переменная, в которую позже будут ложиться массивы рейсов
	let new_flights = await funcsAPI.FlightsTableGet();		// Отсюда летит запрос в БД
	
	flights = new_flights.rows;								// форматная загрузка данных (те что вернула функция в переменную-массив flights,
	//console.log(flights);									// проверка переливки в переменную-массив flights)

	const tbody = flightList;
	
	// Некие общие действия над данными, полученными из БД, на начальном этапе разбора дерева
	flights.forEach(flight => {								// для каждого рейса достаются все значения его полей и пишутся в переменные
		var cell_flight_id = flight.id;
		var cell_flight_destination = flight.destination;
		var cell_flight_ferry_name = flight.ferry_name;
		
		var tr = null;										// table row - это уже наполняем HTML-макет
		
		if (cell_flight_id !== null)						// С фильтрующим условием: рендерить только те строки БД, которые полностью заполнены (в которых есть данные).
		{													// По архитектуре данного приложения, в БД обязаны лежать строки с заполненными ID, но
			if (cell_flight_destination !== null)			// остальные поля могут принимать и пустые значения, и отсюда правило: те записи в БД,
			{												// которые содержат в себе пустые ячейки, сделать возможными для редактирования только со
				if (cell_flight_ferry_name !== null)		// стороны API СУБД, а с API данного приложения - не показывать такие строки в общей таблице
				{											// притом вход в режим редактирования осуществляется кнопкой в окне ДЕЙСТВИЯ напротив конкретной записи
					tr = createFlightRow(flight);				// создаём рейс и запихиваем его в конец;
				}											// так же, дополнительная гарантия - запретить внесение записей с пустыми ячейками, т.е. на стороне
			}												// клиента формировать запрос на конкретную ручку, ассоциированную с SQL-запросом, и до внесения изменений
		}													// на стороне клиента (просто вставки данных в форму таблицы), дожидаться подтверждения от БД, что SQL-запрос выполнен успешно
															// тогда строки с заполненными либо Ferries_Name, либо Destination, 
		//console.log(tr);									// есть же ещё и Cargos
		if (tr !== null)
		{
			tbody.appendChild(tr);
		}
		else
		{
			//Promise.reject('String is not fullfilled').then(resolved, rejected);
		}
	});

	var AddFlightWasClicked = false;
	var currentFlightId = null;								// Переменная-индикатор выбранного (активного рейса) для работы с логикой
	var currentMode = -1;									// null - view, 1 - редактирование, -1 - просмотр
	var editingFlight;
	// Можно производить редактирование 1 рейса максимум одновременно на 1 клиенте (надо подумать как реализовать)
	// А то по одному разу кликаю на разные кнопочки, и события как бы "прилипают", хотя такого быть не должно
	
	const addNewDestinationButton = document.getElementById('add-new-destination');
	// Кнопка для добавления нового пункта назначения
	addNewDestinationButton.addEventListener('click', async () => {
		
		const addDestination = async () => {
			const dest = document.getElementById('dest-input').value;

			// Проверка на допустимость пустого значения или дубликатов
			if (!dest) {
				alert('Введите название нового пункта назначения');
				return;
			}
		
			try {
				console.log(JSON.stringify({ destination : dest }));
				const response = await fetch('/api/add-destination', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ destination : dest }),
				});

				if (!response.ok) {
					throw new Error('Network response was not ok ' + response.statusText);
				}

				const data = await response.json();
				console.log('Response:', data); // Успешный ответ от сервера
				document.getElementById('dest-input').value = '';
			} catch (error) {
				console.error('Error adding destination:', error.message);
			}
		};
		
		addDestination();
	});

    addFlightBtn.addEventListener('click', async () => {	// Нажатие кнопки "Добавить рейс"
		if (AddFlightWasClicked == false)
		{
			resetForm();
			formTitle.textContent = 'Добавление рейса';
			document.getElementById('flight-form').classList.remove('hidden'); // выдача меню рейсов, настроенного на добавление
			
			// ВЫЗОВ DestinationAndFerry
			let result = await DestinationAndFerry(flights);			// отсюда летит запрос в КЭШ
			//console.log(result.ferry_names);							// прилёт: имена паромов
			//console.log(result.destinations);							// прилёт: пункты назначения
			//console.log(result.new_id);								// прилёт: новый id строки таблицы
			
			const NextFlightID = document.getElementById('flight-id');	// серия запросов id элементов в документе (html-странице)
			const Destination = document.getElementById('destination');
			const Ferry = document.getElementById('ferry');
			
			var MustBeSetID = result.new_id;
			//currentFlightId = MustBeSetID;
			var MustBeSet_NFID = 'ID: ' + MustBeSetID;					// пробрасывание id в текстовое поле
			//console.log(MustBeSet_NFID);
			NextFlightID.innerText = MustBeSet_NFID;

			let MentionedDestinations = [];
			
			result.destinations.forEach(option => {						// пробрасывание пула пунктов назначения из бд в поле вьюшной таблицы
				const CheckIndex = MentionedDestinations.findIndex(opt => opt === option);
				if (CheckIndex === -1)									// если элемента нету в выпадающем списке, добавляем его
				{
					const optionElement = document.createElement('option');
					optionElement.value = option;
					optionElement.textContent = option;
					Destination.appendChild(optionElement);
					MentionedDestinations.push(option);
				}
				/*
				else
				{
					;	//если элемент есть в добавляющем списке, не добавляем его
				}
				*/
			});
			//console.log(MentionedDestinations);
			
			/*
			const optionElementDefault1 = document.createElement('option');
			optionElement.value = '(Выберите пункт назначения)';
			optionElement.textContent = option;
			Destination.appendChild(optionElementDefault1);
			*/
			let MentionedFerries = [];
			
			result.ferry_names.forEach(option => {						// пробрасывание пула имён паромов из бд в поле вьюшной таблицы
				const CheckIndex = MentionedFerries.findIndex(opt => opt === option);
				if (CheckIndex === -1)									// если элемента нету в выпадающем списке, добавляем его
				{
					const optionElement = document.createElement('option');
					optionElement.value = option;
					optionElement.textContent = option;
					Ferry.appendChild(optionElement);
					MentionedFerries.push(option);
				}
			});
			
			//console.log(MentionedFerries);
			
			/*
			const optionElementDefault2 = document.createElement('option');
			optionElement.value = '(Выберите паром)';
			optionElement.textContent = option;
			Ferry.appendChild(optionElementDefault2);
			*/
			AddFlightWasClicked = true;									// сигнализирование о посещении -> запрет на производство повторных запросов
			currentMode = null;
			
			await renderFlights();
		}
    });

    cancelBtn.addEventListener('click', resetForm);
		
	addCargoButton.addEventListener('click', async () => {
		const cargoTypeElement = document.querySelector('input[name="cargo-type"]:checked');
		
		// Проверяем, выбрана ли опция
		if (!cargoTypeElement) {
			// Если не выбрана, выводим предупреждение и прекращаем выполнение
			alert('Пожалуйста, выберите тип груза, прежде чем продолжить.');
			return; // прекращаем выполнение функции
		}

		// Если выбрана, продолжаем выполнение
		const cargoType = cargoTypeElement.value;
		let cargoParam;

		if (cargoType === 'container') {
			cargoParam = prompt('Введите целое положительное число для контейнера:');
			if (!Number.isInteger(Number(cargoParam)) || Number(cargoParam) <= 0) {
				alert('Пожалуйста, введите действительное число');
				return;
			}
		} else {
			cargoParam = prompt('Выберите тип: L, M или H');
			if (!['L', 'M', 'H'].includes(cargoParam)) {
				alert('Пожалуйста, выберите допустимый тип (L, M или H)');
				return;
			}
		}

		try {
			const response = await fetch('/api/add-cargo', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ cargoType, cargoParam })
			});

			const result = await response.json();
			console.log(result);
			await renderFlights(); // обновляем список рейсов после добавления груза
		} catch (error) {
			console.error('Ошибка при добавлении груза:', error);
		}
	});

	deleteCargoButton.addEventListener('click', async () => {
		async function deleteCargo(cargoId) {
			try {
				const response = await fetch(`/api/delete-cargo/${cargoId}`, {
					method: 'DELETE'
				});

				const result = await response.json();
				console.log(result);
				await renderFlights(); // обновляем список рейсов после удаления
			} catch (error) {
				console.error('Ошибка при удалении груза:', error);
			}
		}
	
	});

	// submit - отправка формы (пользовательское действие) => нужен POST-запрос => нужна функция-обработчик POST-запроса
    flightForm.addEventListener('submit', async (e) => {
        e.preventDefault();	// предотвращает НЕ просто перезагрузку страницы (но и её тоже), но прежде всего отправку данных на сервер
		var Fid = flightIdInput.innerText;
		var FlightID = Fid.slice(4, Fid.length);
		currentFlightId = FlightID;
		//console.log(currentFlightId, 'CURRENT FLIGHT ID');
		
        const destination = document.getElementById('destination').value;
        const ferry = document.getElementById('ferry').value;
		
		var flight_to_operate;
		const index = flights.findIndex(flight => flight.id === currentFlightId);
		
		var FDW = flightForm.destination.value;
		var FFV = flightForm.ferry.value;

        if (currentMode == 1) {
            // Редактирование существующего рейса	
			console.log(index, "INDEX_REDAKT");
			
			console.log(FDW, FFV, "FF VALUE");
			var destv = flightForm.destination.value;
			var formv = flightForm.ferry.value;
            flight_to_operate = { id : parseInt(FlightID), destination : destv, ferry_name : formv};
			const indexToEdit = flights.findIndex(flight => flight.id == FlightID);
			flights[indexToEdit] = flight_to_operate;
								
			// вызов API
			var response = funcsAPI.FlightsTablePut(flight_to_operate);
			renderFlights();
			currentMode = null;
            
			//showNotification('Рейс обновлен!');
        } else if (currentMode == -1) {
			// ... просмотр ... ожидание взаимодействия пользователя со страницей
			console.log('EDITING MODE HASN\'T BEEN CHANGED');
		} else if (currentMode == null) {
            // Добавление нового рейса
			
			// ( 	1 - формирование запросов
			// 		2 - валидация запроса на стороне клиента )
			// 3 - отправка на сервер и получение ответа от сервера (код ответа, базово: выполнен или
			// не выполнен, если нет, то почему?)
			
			// Реализация:
			// 1 - funcsAPI.FlightsTablePost(data) - это готовый обработчик задачи посылки запроса на сервер
			
			// 2 - что отправлять? Данные, которые имеются в JSON-формате и хранятся в переменной flight_to_operate
			var destv = flightForm.destination.value;
			var formv = flightForm.ferry.value;
			
			flight_to_operate = { id : parseInt(FlightID), destination : destv, ferry_name : formv};
			console.log(flight_to_operate);
			
			// 3
			console.log("Client: Starting Server Post Request");
			var PostResponse;
			try {
				PostResponse = await funcsAPI.FlightsTablePost(flight_to_operate);
				console.log("Client: Server Post Response is Success: ", PostResponse);
				flights.push(flight_to_operate);
				
			} catch (error) {
				console.log("Client: Server Post Response is Failed: ", PostResponse);
			}
			console.log(index, "INDEX_ADD");
		} else {
			console.log('ERROR_OF_CURRENT_MODE');
		}
		resetForm();
        renderFlights();
    });
	
	const EditFlight = async (e) => {	// обработчик события редактирования рейса
		// Установка режима редактирования
		currentMode = 1;
	
		// Обработка id
		var flight_id = parseInt(e);
		console.log(flight_id, "EDIT");
		
		// Подготовка визуализации и обновления UI
		resetForm();
		formTitle.textContent = 'Редактирование рейса';
		flightIdInput.innerText = "ID: " + flight_id;
		const Destination = document.getElementById('destination');
		const Ferry = document.getElementById('ferry');
    
		// Очистить текущие опции
		Destination.innerHTML = "";
		Ferry.innerHTML = "";
		
		// Получить текущий рейс
		const selectedFlight = flights.find(flight => flight.id === flight_id);
		var this_destination;
		var this_ferry_name;

		// Добавить текущее значение в начало списка
		if (selectedFlight) {
			const currentDestinationOption = document.createElement("option");
			const currentFerryOption = document.createElement("option");
					
			currentDestinationOption.value = selectedFlight.destination;
			currentDestinationOption.textContent = selectedFlight.destination;
			currentFerryOption.value = selectedFlight.ferry_name;
			currentFerryOption.textContent = selectedFlight.ferry_name;
			
			this_destination = selectedFlight.destination;
			this_ferry_name = selectedFlight.ferry_name;
			
			Destination.appendChild(currentDestinationOption);
			Ferry.appendChild(currentFerryOption);
		}
		
		let formData = {
			id: flight_id,
			destination: this_destination,
			ferry_name: this_ferry_name
		};
		
		editingFlight = formData;
		function updateFormData(event) {
			var { name, value } = event.target;
			if (name == "ferry")
			{
				name = "ferry_name";
			}
			formData[name] = value; // Обновляем состояние
			console.log("LOCAL UPDATE ON DROPLIST: ", formData);
			editingFlight = formData;
		}
		
		// Обработчики событий для формы
		Destination.addEventListener("change", updateFormData);
		Ferry.addEventListener("change", updateFormData);

		// Получить остальные уникальные (по отношению к выбранному среди всех имеющихся в базе) пункты назначения
		const otherDestinations = [...new Set(flights.map(flight => flight.destination))]
			.filter(destination => destination !== selectedFlight?.destination && destination);

		// Отсортировать остальные пункты назначения в алфавитном порядке
		otherDestinations.sort();

		// Добавить остальные значения в выпадающий список
		otherDestinations.forEach(destination => {
			const option = document.createElement("option");
			option.value = destination;
			option.textContent = destination;
			Destination.appendChild(option);
		});
		
		// Получить остальные уникальные (по отношению к выбранному среди всех имеющихся в базе) наименования паромов
		const otherFerries = [...new Set(flights.map(flight => flight.ferry_name))]
			.filter(ferry_name => ferry_name !== selectedFlight?.ferry_name && ferry_name);

		// Отсортировать остальные наименования паромов в алфавитном порядке
		otherFerries.sort();
		console.log(otherFerries);

		// Добавить остальные значения в выпадающий список
		otherFerries.forEach(ferry_name => {
			const option = document.createElement("option");
			option.value = ferry_name;
			option.textContent = ferry_name;
			Ferry.appendChild(option);
		});
		
		// Отображение формы отправки данных
		document.getElementById('flight-form').classList.remove('hidden'); // выдача меню рейсов, настроенного на добавление
		
		// Перед вызовом API: получение данных из формы - нет! Они будут браться из переменных: так надёжнее
		
		if (flight_id && this_destination && this_ferry_name)
		{
			console.log('Data is ready to be sent', editingFlight);
		}
		else
		{
			console.log('Error processing data');
		}
	}
		
	const DeleteFlight = async (e) => {	// обработчик события удаления рейса				
		var flight_id = parseInt(e);
		console.log(flight_id, "DELETE");
		
		var msg = "Вы уверены, что хотите удалить рейс с ID = " + flight_id.toString() +"?";
        if( !confirm(msg)) {
            e.preventDefault(); // ! => don't want to do this
        } else {
            funcsAPI.FlightsTableDelete(flight_id);		// вызов API
        }		
		const indexToDelete = flights.findIndex(flight => flight.id == flight_id);
		delete flights[indexToDelete];
		renderFlights();
	}
	
    function renderFlights() {				// рендер таблицы с полной перезагрузкой строк
        flightList.innerHTML = '';
		flights.forEach(flight => {
			var cell_flight_id = flight.id;
			var cell_flight_destination = flight.destination;
			var cell_flight_ferry_name = flight.ferry_name;
			
			var FL_ELEMENT = null;
						
			if (cell_flight_id !== null)
			{
				if (cell_flight_destination !== null)
				{
					if (cell_flight_ferry_name !== null)
					{
						FL_ELEMENT = createFlightRow(flight);			// создаём рейс и запихиваем его в конец;
					}
				}
			}
			
			if (FL_ELEMENT !== null)
			{
				flightList.appendChild(FL_ELEMENT);
			}
			
        });
    }
		
	function resetForm() {			// Сброс формы редактирования рейсов
		flightForm.reset();
		AddFlightWasClicked = false;	
		
		// Общий алгоритм работы метода: обнуление и скрытие
		const Destination = document.getElementById('destination');
		const Ferry = document.getElementById('ferry');
		
		var length = Destination.options.length;
		for (var i = length-1; i >= 0; i--) {
			Destination.options[i] = null;
		}
		
		var length = Ferry.options.length;
		for (var i = length-1; i >= 0; i--) {
			Ferry.options[i] = null;
		}
		
		currentFlightId = null;
		document.getElementById('flight-form').classList.add('hidden');
		notification.classList.add('hidden');
	}

	function showNotification(message) {
		notification.textContent = message;
		notification.classList.remove('hidden');
		setTimeout(() => {
			notification.classList.add('hidden');
		}, 3000);
	}
	
	function createFlightRow(flight) {				// cоздание одного рейса
		const tr = document.createElement('tr');	// table row
		tr.setAttribute('key', flight.id);
		//console.log("CONTENT=FLIGHT=", flight);
		
		var cell_flight_id = flight.id;
		var cell_flight_destination = flight.destination;
		var cell_flight_ferry_name = flight.ferry_name;

		tr.appendChild(createTableCell(cell_flight_id));
		tr.appendChild(createTableCell(cell_flight_destination));
		tr.appendChild(createTableCell(cell_flight_ferry_name));
		tr.appendChild(createActionCell(cell_flight_id));

		return tr;
	}

	function createTableCell(content) {				// создание табличной ячейки, хранящей данные
		const td = document.createElement('td');
		td.textContent = content;
		return td;
	}

	function createActionCell(flightId) {			// создание ячейки действия, содержащей кнопки
		const tdActions = document.createElement('td');

		const editButton = createButton('/edit.svg', 'Редактировать', () => EditFlight(flightId));
		const deleteButton = createButton('/delete.svg', 'Удалить', () => DeleteFlight(flightId));

		tdActions.appendChild(editButton);
		tdActions.appendChild(deleteButton);

		return tdActions;
	}

	function createButton(imgSrc, altText, onClick) {	// создание кнопки
		const button = document.createElement('button');
		
		var button_type;
		if (altText == 'Редактировать' || altText == 'Удалить')
		{
			if (altText == 'Редактировать')
			{
				button_type = 'edit-btn';
			} else
			{
				button_type = 'delete-btn';
			}
			button.classList.add(button_type);
		}
		
		const img = document.createElement('img');
		img.src = imgSrc;
		img.alt = altText;

		button.appendChild(img);
		button.onclick = onClick;
		
		return button;
	}

	function refreshPage() {
       window.location.reload();
   }

});