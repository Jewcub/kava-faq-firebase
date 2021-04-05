import './App.css';
import React, { useState, useEffect } from 'react';
import Body from './components/Body.jsx';
import { ImSpinner3 } from 'react-icons/im';
function App() {
	const isProd = process.env.NODE_ENV === 'production';
	const apiURL = isProd
		? '/api/get-faq'
		: 'http://localhost:5001/kava-faq/us-central1/api/api/get-faq';
	console.log(apiURL);
	const [faqJSON, setfaqJSON] = useState({ sections: null });
	const start = async () => {
		// console.log("NODE_ENV: ", process.env.NODE_ENV);
		const faqReq = await fetch(apiURL);
		const data = await faqReq.json();
		await setfaqJSON(JSON.parse(data.faq));
		// console.log({ faqJSON });
	};
	useEffect(() => {
		start();
	}, []);
	return (
		<div className="App scroller">
			<div className="main-wrapper">
				<h1 className="main-title"> KAVA INTERNAl FAQ</h1>
				{faqJSON.sections ? (
					<Body content={faqJSON}></Body>
				) : (
					<div className="spinner-wrapper">
						<ImSpinner3 className="loading-spinner" />
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
