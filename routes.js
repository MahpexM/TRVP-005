const express = require('express');
const db = require('./db');

const router = express.Router();

// Получение информации о рейсах
router.get('/api/flights', async (req, res) => {
	//console.log('STARTED GET REQUEST STARTED');
	const result = await db.query('SELECT * FROM flights');
	res.json(result);
});

// Добавление рейса
router.post('/api/flights', async (req, res) => {
    console.log('STARTED POST REQUEST');
    console.log(req.body);
    
    const { id, ferry_name, destination } = req.body;
    if (!id || !destination || !ferry_name) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
		//console.log('(id, destination, ferry_name) VALUES ($1, $2, $3)', [id, destination, ferry_name]);
        const result = await db.query('INSERT INTO public.flights (id, destination, ferry_name) VALUES ($1, $2, $3) RETURNING *', [id, destination, ferry_name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log('Error inserting flight:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Редактирование рейса
router.put('/api/flights/:id', async (req, res) => {
    const { id } = req.params;
    const { destination, ferry_name } = req.body;
	//console.log(id, destination);
    const result = await db.query('UPDATE flights SET destination = $1, ferry_name = $2 WHERE id = $3 RETURNING *', [destination, ferry_name, id]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.json(result.rows[0]);
});

// Удаление рейса
router.delete('/api/flights/:id', async (req, res) => {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM flights WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.status(204).send();
});

// Получение уникальной информации о рейсах - информации об уникальных рейсах
router.get('/api/unique_destinations', async (req, res) => {
	const result = await db.query('SELECT DISTINCT destination FROM flights');
	res.json(result);
});

// Получение информации о погрузках
/*
router.get('/api/loads', async (req, res) => {
	//console.log('STARTED GET REQUEST STARTED');
	const result = await db.query('SELECT * FROM flights');
	res.json(result);
});
*/

router.post('/api/add-destination', async (req, res) => {
    //console.log('STARTED POST REQUEST');
    //console.log(req.body);
	
    const { destination } = req.body; // Ожидаем destination

	// надо получить свежий flights (а вернее максимальный id)
	const maxFlightID_response = await db.query('SELECT MAX(id) AS maxFlightID FROM flights');	
	const maxFlightID = maxFlightID_response.rows[0]?.maxflightid;
	if (maxFlightID !== undefined) {
		console.log('Max Flight ID:', maxFlightID); // Выводит: Max Flight ID: 101
	} else {
		console.log('Max Flight ID not found');
	}

    // Проверяем, что destination и maxFlightID предоставлено
    if (!destination || !maxFlightID) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        // Находим максимальный ID среди переданных рейсов
        const newId = maxFlightID + 1; // Новый ID для вставки

        // Проверяем дублирование пункта назначения
        const checkDuplicate = await db.query('SELECT * FROM public.flights WHERE destination = $1', [destination]);
        
        if (checkDuplicate.rowCount > 0) {
            return res.status(409).json({ error: 'Destination already exists' }); // 409 Conflict
        }

        // Вставляем новый пункт назначения
        const result = await db.query('INSERT INTO public.flights (id, destination) VALUES ($1, $2) RETURNING *', [newId, destination]);
        
        // Возвращаем добавленный пункт назначения в ответе
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log('Error inserting flight:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Добавление груза
router.post('/api/cargo', async (req, res) => {
    //console.log('STARTED POST REQUEST');
    //console.log(req.body);
	
    const { destination } = req.body; // Ожидаем destination

	// надо получить свежий flights (а вернее максимальный id)
	const maxFlightID_response = await db.query('SELECT MAX(id) AS maxFlightID FROM flights');	
	const maxFlightID = maxFlightID_response.rows[0]?.maxflightid;
	if (maxFlightID !== undefined) {
		console.log('Max Flight ID:', maxFlightID); // Выводит: Max Flight ID: 101
	} else {
		console.log('Max Flight ID not found');
	}

    // Проверяем, что destination и maxFlightID предоставлено
    if (!destination || !maxFlightID) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        // Находим максимальный ID среди переданных рейсов
        const newId = maxFlightID + 1; // Новый ID для вставки

        // Проверяем дублирование пункта назначения
        const checkDuplicate = await db.query('SELECT * FROM public.flights WHERE destination = $1', [destination]);
        
        if (checkDuplicate.rowCount > 0) {
            return res.status(409).json({ error: 'Destination already exists' }); // 409 Conflict
        }

        // Вставляем новый пункт назначения
        const result = await db.query('INSERT INTO public.flights (id, destination) VALUES ($1, $2) RETURNING *', [newId, destination]);
        
        // Возвращаем добавленный пункт назначения в ответе
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.log('Error inserting flight:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Удаление груза
router.delete('/api/cargo/:id', async (req, res) => {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM flights WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.status(204).send();
});

// Редактирование груза
router.put('/api/cargo/:id', async (req, res) => {
    const { id } = req.params;
    const { destination, ferry_name } = req.body;
	//console.log(id, destination);
    const result = await db.query('UPDATE flights SET destination = $1, ferry_name = $2 WHERE id = $3 RETURNING *', [destination, ferry_name, id]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.json(result.rows[0]);
});

module.exports = router;
