const track = () => {
	let _start = new Date();
	return {
		terminate() { return ((new Date() - _start) / 1000).toFixed(2); },
		restart() { _start = new Date(); },
	};
};


const tr = track();
const tr2 = track();

setTimeout(() => {
	console.log(tr.terminate());
}, 1500);

setTimeout(() => {
	console.log(tr2.terminate());
}, 2500);

