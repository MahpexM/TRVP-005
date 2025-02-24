const DestinationAndFerry = async (flights) => {	// Поисковая функция
	let ferry_names = [];
	let destinations = [];
	var max_id = 0;
	
	const inner_function = async () => {
		flights.forEach((item) => {
			var FI = item["ferry_name"];
			var DI = item["destination"];
			
			if (FI)
			{
				//console.log("FI", FI);
				ferry_names.push(FI);
			}
			if (DI)
			{
				destinations.push(DI);
				//console.log("DI", DI);
			}
			if (max_id < item["id"])
			{
				max_id = item["id"];
			}
			//console.log(item["destination"]);
			//console.log(item["ferry_name"]);
		});
		var new_id = ++max_id;
		//console.log('NI:' + new_id);
		return {new_id, destinations, ferry_names};
	};
	
	let result = await inner_function();
	return result;
};

export default DestinationAndFerry;