const FlightsTableGet = async () => {
    const fetchFlights = async () => {		// Функция для получения данных с сервера
		const response = fetch('/api/flights').then((resp) => resp.json());	// PROMISE
		//const data = await response.json();
		//console.log(data.rows);
		//document.getElementById('flight-list').innerHTML = FlightsTable(data);
		return response;
	};
	
	return await fetchFlights();
};

const FlightsTablePost = async (data) => {
    const jsonData = JSON.stringify(data);
    console.log(jsonData, '____JSON____DATA____');
    
    const fetchFlights = async () => {
		console.log("Client: Started Server Post Request");
        try {
            const response = await fetch('/api/flights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching flights:', error);
            throw error; // Перебрасываем ошибку дальше
        }
    };
    
    return await fetchFlights();
};

const FlightsTablePut = async (data) => {							// Тот же самый POST, но на обновление существующих строк
    const jsonData = JSON.stringify(data);
    console.log(jsonData, '____JSON____DATA____');
    
    const fetchFlights = async () => {
		console.log("Client: Started Server Put/Update Request");
        try {
			const id = data.id;
            const response = await fetch('/api/flights/' + id.toString(), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching flights:', error);
            throw error; // Перебрасываем ошибку дальше
        }
    };
    
    return await fetchFlights();
}

const FlightsTableDelete = async (flight_id) => {
	console.log("Client: Started Server Delete Record Request");
        try {
            const response = await fetch('/api/flights/' + flight_id.toString(), {
                method: 'DELETE',
            });
            if (!response.ok) {
				console.log('DELETION FAILED');
                throw new Error('Network response was not ok');
            }
			else
			{
				console.log('DELETION SUCCESS');
			}
            return await response.json();
        } catch (error) {
            console.error('Error fetching flights:', error);
            throw error; // Перебрасываем ошибку дальше
        }
}

const UniqueDestinationsGet = async () => {
    const response = await fetch('/api/unique_destinations');
	const data = await response.json()
    return data;
};

/*
const FlightsTablePost = async (data) => {

	// Преобразование объекта в JSON
	const jsonData = JSON.stringify(data);
	console.log(jsonData, '____JSON____DATA____');
	
    const fetchFlights = async () => {		// Функция для отправки данных на сервер
		const response = fetch('/api/flights', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
//		  body: JSON.stringify({ key: 'value' })	// в аргументе - шаблон для stringify
		  body: jsonData							// так лучше
		}).then((resp) => resp.json());	// PROMISE
		//const data = await response.json();
		//console.log(data.rows);
		//document.getElementById('flight-list').innerHTML = FlightsTable(data);
		return response;
	};
	
	return await fetchFlights();
};*/

const funcsAPI = {
	FlightsTableGet,
	FlightsTablePost,
	FlightsTablePut,
	FlightsTableDelete,
	UniqueDestinationsGet
};

export default funcsAPI;