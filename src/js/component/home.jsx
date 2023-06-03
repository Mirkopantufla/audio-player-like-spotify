//Con sudor y esfuerzo mi orgullo hasta el momento JAJAJA

import React, { useEffect, useRef, useState } from "react";
import Cancion from "./Cancion.jsx";
import listaCanciones from "../listaCanciones.js"
import { BsPlayCircleFill, BsSkipEndFill, BsSkipStartFill, BsRepeat, BsVolumeUpFill, BsVolumeDownFill, BsShuffle, BsPauseBtnFill } from 'react-icons/bs';

const Home = () => {

	const baseUrl = "https://assets.breatheco.de/apis/sound/";

	const [volumen, setVolumen] = useState(0.50);

	//Al final del proyecto intente poner null y quitar completamente la lista y el archivo js
	//pero no resulto. Asi que aqui se quedo :D
	//lo importante es que la data posterior al primer renderizado es lo provisto por la API
	const [songs, setSongs] = useState(listaCanciones);

	const [songName, setSongName] = useState("");

	const [playing, setPlaying] = useState(false);

	const [loop, setLoop] = useState(false);

	const [shuffle, setShuffle] = useState(false);

	const [actualDuration, setActualDuration] = useState("00:00");

	const [totalDuration, setTotalDuration] = useState("00:00");

	const [estadoIntervalo, setEstadoIntervalo] = useState(false);

	const refAudio = useRef("");

	const refProgress = useRef("");

	let intervalo;


	useEffect(() => {

		obtenerCanciones()

	}, [])


	useEffect(() => {
		//Ya que tengo muchas partes donde se puede activar la musica, cada vez que el estado de playing
		//se modifique en algun lado, se activara el contador solo la primera vez
		if (playing == true) {
			if (estadoIntervalo == false) {
				intervalo = setInterval(progresoCancion, 1000);
				setEstadoIntervalo(true);
			}
		} else {
			clearInterval(intervalo);
		}
	}, [playing])

	//Fetch a la api de canciones
	const obtenerCanciones = () => {
		fetch("https://assets.breatheco.de/apis/sound/songs", {})
			.then((response) => response.json())
			.then((data) => {
				//Las canciones que venian de esta ruta venian con error asi que las quite previamente
				let arraySong = data.filter((dato) => !dato.url.includes('files/other'));
				let aux = 1;
				//Para efectos de correcta reproduccion de la lista, al venir la data, a cada cancion le añado
				//un atributo personalizado para no sufrir con backends de id duplicadas
				arraySong.forEach(song => {
					song.songPosition = aux++;
				});

				setSongs(arraySong);
			})
			.catch((error) => console.log(error));
	}

	//------------------------------------------------------------------------------------------------------------
	//Al elegir la cancion manualmente de la lista
	const chooseSong = (cancion) => {
		pauseSong();
		refAudio.current.src = baseUrl + cancion.url;
		playSong();
	}

	//------------------------------------------------------------------------------------------------------------
	//Play y Pause a la cancion, tambien para manejar el cambio de icono
	const playSong = () => {
		refAudio.current.play();
		setPlaying(true);
	};

	const pauseSong = () => {
		refAudio.current.pause();
		setPlaying(false);
	};

	const flowMusic = () => {
		if (!playing) {
			playSong();
		} else {
			pauseSong();
		};
	};

	//------------------------------------------------------------------------------------------------------------
	//Cancion siguiente a la actual de la lista
	const nextSong = () => {
		pauseSong();
		if (shuffle == false) {
			let siguiente = 0;
			let linkCancion = refAudio.current.src;
			songs.forEach(song => {
				if (linkCancion.includes(song.url)) {
					siguiente = song.songPosition;
				}
			});

			if (songs[siguiente]) {
				refAudio.current.src = baseUrl + songs[siguiente].url;
			} else {
				refAudio.current.src = baseUrl + songs[0].url;
			}
		} else {
			shuffleSong();
		}
		playSong();
	};

	//------------------------------------------------------------------------------------------------------------
	//Cancion anterior a la actual de la lista
	const lastSong = () => {
		pauseSong();
		if (shuffle == false) {
			let siguiente = 0;
			let linkCancion = refAudio.current.src;
			songs.forEach(song => {
				if (linkCancion.includes(song.url)) {
					siguiente = song.songPosition - 1;
				}
			});


			if (siguiente == 0) {
				refAudio.current.src = baseUrl + songs[songs.length - 1].url;
			} else {
				refAudio.current.src = baseUrl + songs[siguiente - 1].url;
			}
		} else {
			shuffleSong();
		}
		playSong();
	};

	//------------------------------------------------------------------------------------------------------------
	//Repite la cancion actual
	const repeatSong = () => {
		if (!loop) {
			refAudio.current.loop = true;
			setLoop(true);
		} else {
			refAudio.current.loop = false;
			setLoop(false);
		}
	};

	//------------------------------------------------------------------------------------------------------------
	//Botones para ajustar el audio
	//Menos volumen dando pasos de 2% por cada nivel hasta un minimo de 0
	const volumeDown = () => {
		refAudio.current.volume = volumen;
		if ((refAudio.current.volume).toFixed(2) != 0) {
			refAudio.current.volume -= 0.02;
			setVolumen((refAudio.current.volume).toFixed(2))
		}
	};
	//Mas volumen dando pasos de 2% por cada nivel hasta un maximo de 100
	const volumeUp = () => {
		refAudio.current.volume = volumen;
		if ((refAudio.current.volume).toFixed(2) != 1) {
			refAudio.current.volume += 0.02;
			setVolumen((refAudio.current.volume).toFixed(2))
		}
	};


	//------------------------------------------------------------------------------------------------------------
	//Funcion para manejar el boton de shuffle y aplicar estilos
	const setOnShuffle = () => {
		if (!shuffle) {
			setShuffle(true);
		} else {
			setShuffle(false);
		}
	};
	//Al estar activado, al cambiar de cancion se pondra una cancion aleatoria
	//menos la que ya esta sonando
	const shuffleSong = () => {
		let siguiente = 0;
		let linkCancion = refAudio.current.src;
		let cancionesDisponibles = []

		songs.forEach(song => {
			linkCancion.includes(song.url) ? "" : cancionesDisponibles.push(song.url)
		});

		siguiente = Math.floor(Math.random() * cancionesDisponibles.length);

		refAudio.current.src = baseUrl + cancionesDisponibles[siguiente];
	};

	//------------------------------------------------------------------------------------------------------------
	//Creo funcion para mantener actualizado la duracion de la cancion
	const progresoCancion = () => {
		changeName()
		//Duracion actual
		let segundoActual;
		isNaN(refAudio.current.currentTime) ? 0 : segundoActual = (refAudio.current.currentTime).toFixed(0);
		refProgress.current.value = segundoActual;
		setActualDuration(changeToMinutes(segundoActual))

		//Duracion total
		let duracion;
		isNaN(refAudio.current.currentTime) ? 0 : duracion = (refAudio.current.duration).toFixed(0);
		refProgress.current.max = duracion
		setTotalDuration(changeToMinutes(duracion));
	}
	//Cambio a una forma legible los segundos a formato de tiempo normal 00:00
	const changeToMinutes = (variable) => {
		let minutos = variable / 60;
		let resto = variable % 60;
		Math.floor(minutos) < 10 ? minutos = "0" + Math.floor(minutos) : null;
		Math.floor(minutos) > 10 ? minutos = Math.floor(minutos) : null;
		resto < 10 ? resto = "0" + resto : null;
		let tiempo = minutos + ":" + resto;
		return tiempo;
	}
	//Con esta funcion actualizo con el slider el tiempo actual, ya que cada paso del slider equivale a 1 seg
	const changeProgress = () => {
		refAudio.current.currentTime = refProgress.current.value;
	}

	//------------------------------------------------------------------------------------------------------------
	//Creo funcion para cambiar el nombre de la cancion actual y lo muestro en pantalla
	const changeName = () => {
		let siguiente = "";
		let linkCancion = refAudio.current.src;
		songs.forEach(song => {
			if (linkCancion.includes(song.url)) {
				setSongName(capitalize(song.name));
			}
		});
	}
	//Creo funcion para capitalizar la primera letra en dos lugares del proyecto
	const capitalize = (nombreNormal) => {
		let nombre = nombreNormal;
		let primeraLetra = nombre.charAt(0)
		let primeraLetraMayus = primeraLetra.toUpperCase()
		let letrasRestantes = nombre.slice(1)
		let nombreCapitalizado = primeraLetraMayus + letrasRestantes
		return nombreCapitalizado;
	}

	return (

		<div className="container">
			<div className="row mt-2">
				<div className="col-12 offset-sm-2 col-sm-8 text-center border border-dark rounded-top">
					<h1>Lista Musica</h1>
				</div>
				<div className="col-12 offset-sm-2 col-sm-8 text-center border border-dark listaScroll">
					<>
						{
							//Por cada cancion presente en el estado songs, imprime una cancion
							songs != null ? songs.map((cancion, id) => (
								<Cancion
									key={id}
									numero={id + 1}
									name={capitalize(cancion.name)}
									funcion={() => chooseSong(cancion)} />
							)) : null
						}
					</>
				</div>
			</div>
			<div className="row">
				<div className="col-12 offset-sm-2 col-sm-8 text-center d-flex justify-content-center pt-1 border border-dark">
					<div className="col-6 d-flex justify-content-start">
						<h5>
							{/* Aqui muestro el nombre de la cancion */}
							{songName}
						</h5>
					</div>
					<div className="col-6 d-flex justify-content-end">
						{/* Aqui muestro el tiempo actual y la duracion total */}
						<h5>{actualDuration}{"/"}{totalDuration}</h5>
					</div>
				</div>
				<div className="col-12 offset-sm-2 col-sm-8 text-center border border-dark d-flex justify-content-center colorHUD">
					{/* Aqui muestro el slider referenciado */}
					<input ref={refProgress} type="range" className="form-range" id="customRange1" min={0} onChange={changeProgress} />
				</div>
			</div>
			<div className="row">
				<div className="col-12 offset-sm-2 col-sm-8 text-center border border-dark d-flex justify-content-center rounded-bottom">
					{/* Botones del reproductor */}
					<button onClick={() => volumeDown()}><BsVolumeDownFill /></button>
					<button onClick={() => volumeUp()}><BsVolumeUpFill /></button>
					<button onClick={() => lastSong()}><BsSkipStartFill /></button>
					<button onClick={() => flowMusic()}>
						{
							playing ? <BsPauseBtnFill /> : <BsPlayCircleFill />
						}
					</button>
					<button onClick={() => nextSong()}><BsSkipEndFill /></button>
					<button onClick={() => repeatSong()}>
						{
							loop ? <BsRepeat className="text-danger" /> : <BsRepeat />
						}
					</button>
					<button onClick={() => setOnShuffle()}>
						{
							shuffle ? <BsShuffle className="text-danger" /> : <BsShuffle />
						}
					</button>
					<audio ref={refAudio} src={baseUrl + songs[0].url} />
				</div>
			</div>
		</div>
	);
};

export default Home;
