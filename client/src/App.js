import './App.css';
import React, { useState, useEffect } from 'react';
import Body from './components/Body.jsx';
import { ImSpinner3 } from 'react-icons/im';
function App() {
	const isDev = process.env.NODE_ENV === 'development';
	const apiURL = isDev
		? 'http://localhost:5001/kava-faq/us-central1/api/get-faq'
		: ' https://us-central1-kava-faq.cloudfunctions.net/api/get-faq';
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
				<h1 className="main-title"> KAVA FAQ (internal)</h1>

				{faqJSON.sections ? (
					<Body content={faqJSON}></Body>
				) : (
					<div className="spinner-wrapper">
						<ImSpinner3 className="loading-spinner" />
					</div>
				)}
				<p className="footnote">
					Compiled from this{' '}
					<a href="https://docs.google.com/document/d/1imzQociewnWFW8dfPM_4cRDrDWdBvhYMcbQ8C6e1-7g/edit?usp=sharing">
						Google Doc
					</a>
				</p>
			</div>
		</div>
	);
}

export default App;
