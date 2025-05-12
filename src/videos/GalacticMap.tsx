import {
	AbsoluteFill,
	Sequence,
	useVideoConfig,
	Loop,
	Img,
	staticFile,
} from 'remotion';
import React, { useState, useEffect } from 'react';
import ChandrilaBig from '../maps/ChandrilaBig.jsx';
import ChandrilaBig2 from '../maps/ChandrilaBig2.jsx';
import ChandrilaMedium from '../maps/ChandrilaMedium.jsx';
import ChandrilaSmall from '../maps/ChandrilaSmall.jsx';
import KuatBig from '../maps/KuatBig.jsx';
import KuatMedium from '../maps/KuatMedium.jsx';
import KuatSmall from '../maps/KuatSmall.jsx';
import CoruscantBig from '../maps/CoruscantBig.jsx';
import CoruscantMedium from '../maps/CoruscantMedium.jsx';
import CoruscantSmall from '../maps/CoruscantSmall.jsx';
import BespinBig from '../maps/BespinBig.jsx';
import BespinMedium from '../maps/BespinMedium.jsx';
import BespinSmall from '../maps/BespinSmall.jsx';
import AdinaxBig from '../maps/AdinaxBig.jsx';
import AdinaxBig2 from '../maps/AdinaxBig2.jsx';
import AdinaxMedium from '../maps/AdinaxMedium.jsx';
import AdinaxSmall from '../maps/AdinaxSmall.jsx';
import AdinaxSmall2 from '../maps/AdinaxSmall2.jsx';
import BatuuBig from '../maps/BatuuBig.jsx';
import BatuuMedium from '../maps/BatuuMedium.jsx';
import BatuuSmall from '../maps/BatuuSmall.jsx';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

/* 
Common Colors

REBELS
{
  "messageText": "rebellions are built on hope",
  "locationText": "Yavin 4",
  "cabinText": "4093",
  "topLettersColor": "#030409",
  "primaryColor": "#af3a12",
  "secondaryColor": "#dd4e1e",
  "keyPriColor": "#AFAFAF",
  "keySecColor": "#FFFFFF",
  "planetsColor": "#939393",
  "jumpsColor": "#DCFF85",
  "pathColor": "#86985B",
  "routesColor": "#171819",
  "regionColor": "#994500",
  "altPlanetColor": "#2B0000",
  "graphColor": "#2D0909",
  "smPathColor": "#313234",
  "backgroundColor": "#000000",
  "regionTextColor": "#ffffff",
  "showCircle": false,
  "logo": "rebel"
}

BOBA FETT
{
  "messageText": "Boba Fett",
  "locationText": "Mandalore",
  "cabinText": "1980",
  "topLettersColor": "#030409",
  "primaryColor": "#5a4d26",
  "secondaryColor": "#217e20",
  "keyPriColor": "#AFAFAF",
  "keySecColor": "#FFFFFF",
  "planetsColor": "#939393",
  "jumpsColor": "#DCFF85",
  "pathColor": "#86985B",
  "routesColor": "#171819",
  "regionColor": "#7e3535",
  "altPlanetColor": "#2B0000",
  "graphColor": "#2D0909",
  "smPathColor": "#313234",
  "backgroundColor": "#000000",
  "regionTextColor": "#b57d7d",
  "showCircle": true,
  "logo": "mandalorian"
}

FIRST ORDER
{
  "messageText": "FOR THE ORDER",
  "locationText": "Cabin",
  "cabinText": "7320",
  "topLettersColor": "#030409",
  "primaryColor": "#B20007",
  "secondaryColor": "#B20007",
  "keyPriColor": "#AFAFAF",
  "keySecColor": "#FFFFFF",
  "planetsColor": "#939393",
  "jumpsColor": "#DCFF85",
  "pathColor": "#86985B",
  "routesColor": "#171819",
  "regionColor": "#9A0000",
  "altPlanetColor": "#2B0000",
  "graphColor": "#2D0909",
  "smPathColor": "#313234",
  "backgroundColor": "#000000",
  "regionTextColor": "#b57d7d",
  "showCircle": true,
  "logo": "firstorder"
}

IMPERIAL
{
  "messageText": "Welcome Home",
  "locationText": "Cabin",
  "cabinText": "7320",
  "topLettersColor": "#030409",
  "primaryColor": "#B20007",
  "secondaryColor": "#B20007",
  "keyPriColor": "#AFAFAF",
  "keySecColor": "#FFFFFF",
  "planetsColor": "#939393",
  "jumpsColor": "#DCFF85",
  "pathColor": "#86985B",
  "routesColor": "#171819",
  "regionColor": "#9A0000",
  "altPlanetColor": "#2B0000",
  "graphColor": "#2D0909",
  "smPathColor": "#313234",
  "backgroundColor": "#000000",
  "regionTextColor": "#b57d7d",
  "showCircle": false,
  "logo": "imperial"
}


*/

const logoStyles = {
  imperial: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '53px',
    left: '15px',
    transform: 'scale(1.19)',
  },
  rebel: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '42px',
    left: '12px',
  },
  firstorder: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '42px',
    left: '12px',
  },
  falcon: { 
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '42px',
    left: '12px',
  },
  mandalorian: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '42px',
    left: '12px',
  },
  imperial1080: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '149px',
    left: '71px',
    transform: 'scale(2.20)',
  },
  rebel1080: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '128px',
    left: '66px',
    transform: 'scale(1.875)',
  },
  firstorder1080: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '128px',
    left: '66px',
    transform: 'scale(1.875)',
  },
  falcon1080: { 
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '128px',
    left: '66px',
    transform: 'scale(1.875)',
  },
  mandalorian1080: {
    position: 'fixed',
    height: '98px',
    width: '98px',
    zIndex: 100,
    top: '128px',
    left: '66px',
    transform: 'scale(1.875)',
  },
};

// Define the prop types using zod schema
const GalacticMapProps = z.object({
  messageText: z.string(),
  locationText: z.string(),
  cabinText: z.string(),
  topLettersColor: zColor(),
  primaryColor: zColor(),
  secondaryColor: zColor(),
  keyPriColor: zColor(),
  keySecColor: zColor(),
  planetsColor: zColor(),
  jumpsColor: zColor(),
  pathColor: zColor(),
  routesColor: zColor(),
  regionColor: zColor(),
  altPlanetColor: zColor(),
  graphColor: zColor(),
  smPathColor: zColor(),
  backgroundColor: zColor(),
  regionTextColor: zColor(),
  showCircle: z.boolean(),
  logo: z.string().nullable(),
  changeIntervalInSeconds: z.number(),
});

const ship = "HALCYON STARCRUISER";

export const GalacticMap: React.FC<z.infer<typeof GalacticMapProps>> = ({
  messageText,
  locationText,
  cabinText,
  topLettersColor,
  primaryColor,
  secondaryColor,
  keyPriColor,
  keySecColor,
  planetsColor,
  jumpsColor,
  pathColor,
  routesColor,
  regionColor,
  altPlanetColor,
  graphColor,
  smPathColor,
  backgroundColor,
  regionTextColor,
  showCircle,
  logo,
  changeIntervalInSeconds,
}) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const { fps, durationInFrames, width } = useVideoConfig();
	const frames = changeIntervalInSeconds * fps; // Update this line

	// Determine if it's 1080p resolution
	const is1080p = width === 1920;

	// Choose the appropriate logo style
	let logoStyle = logo ? logoStyles[`${logo}${is1080p ? '1080' : ''}`] : null;
	if (logo === 'halcyon') {
		logoStyle = null
	}

	const MAPS = [
		ChandrilaBig,
		ChandrilaMedium,
		ChandrilaSmall,
		CoruscantBig,
		CoruscantMedium,
		CoruscantSmall,
		KuatBig, 
		KuatMedium, 
		KuatSmall,
		BespinBig,
		BespinMedium,
		BespinSmall,
		AdinaxBig,
		AdinaxMedium,
		AdinaxSmall,
		BatuuBig,
		BatuuMedium,
		BatuuSmall,
		AdinaxBig2,
		AdinaxMedium,
		AdinaxSmall2,
		ChandrilaBig2,
		ChandrilaMedium,
		ChandrilaSmall,	
	]

	useEffect(() => {
		const intervalId = setInterval(() => {
			// Calculate the next image index, looping back to the first image if necessary
			setCurrentImageIndex((prevIndex) => (prevIndex + 1) % MAPS.length);
		}, 1000); // 60,000 milliseconds = 1 minute

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalId);
	}, [MAPS]);

	// A <AbsoluteFill> is just a absolutely positioned <div>!
	return (
		<AbsoluteFill>
			<div>
				<div className="map">
					<Loop durationInFrames={1 * frames * MAPS.length}>
						{MAPS.map(function (MapComponent, i) {
							return (<Sequence from={frames * i} durationInFrames={frames}>
								<MapComponent 
                  // @ts-ignore
                  topLettersColor={topLettersColor}
									primaryColor={primaryColor} 
									secondaryColor={secondaryColor} 
									keyPriColor={keyPriColor} 
									keySecColor={keySecColor} 
									planetsColor={planetsColor} 
									jumpsColor={jumpsColor} 
									pathColor={pathColor}
									routesColor={routesColor}
									altPlanetColor={altPlanetColor}
									graphColor={graphColor}
									smPathColor={smPathColor}
									regionColor={regionColor}
									backgroundColor={backgroundColor}
                  regionTextColor={regionTextColor}
								/>
							</Sequence>)
						})}
					</Loop>
				</div>
				<div className="front">
					<div className="banner-container">
						{logo && logoStyle && (
							<Img 
								style={logoStyle}
								src={staticFile(`/logos/${logo}.svg`)}
							/>
						)}
						<svg className="banner" viewBox="0 0 2854 442" preserveAspectRatio="None">
							<rect x="2147" y="0.499756" fill="#030409" fillOpacity="1" fillRule="evenodd" strokeLinejoin="round"
								width="704" height="372" />
							<rect x="1379" y="0.5" fill="#030409" fillOpacity="1" fillRule="evenodd" strokeLinejoin="round"
								stroke="#030409" strokeOpacity="1" width="960" height="372" />
							<path fill="#030409" fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
								d="M 3.00059,0.499756L 1379,0.499756L 1379,372.5L 794,372.5L 727,422.5L 243.693,421.5L 171,439.5L 101.693,421.5L 2.99998,421.5L 3.00059,372.5L 3.00059,0.499756 Z " />
							{logoStyle ? (
								showCircle ? (
									<ellipse 
										fill="none" 
										strokeWidth="10" 
										strokeLinejoin="round" 
										stroke={primaryColor} 
										strokeOpacity="1"
										cx="170.005" 
										cy="276.491" 
										rx="129.915" 
										ry="128.387" 
									/>
								) : null
							) : (
								<>
									<ellipse 
										fill="none" 
										strokeWidth="10" 
										strokeLinejoin="round" 
										stroke={primaryColor} 
										strokeOpacity="1"
										cx="170.005" 
										cy="276.491" 
										rx="129.915" 
										ry="128.387" 
									/>
									<path 
										fill={primaryColor} 
										fillOpacity="1" 
										strokeWidth="3" 
										strokeLinejoin="round" 
										stroke={primaryColor}
										strokeOpacity="1"
										d="M 202,188.5C 208.075,188.5 213,193.304 213,199.23C 213,205.156 208.075,209.959 202,209.959C 195.925,209.959 191,205.156 191,199.23C 191,193.304 195.925,188.5 202,188.5 Z " 
									/>
									<ellipse 
										fill="none" 
										strokeWidth="16" 
										strokeLinejoin="round" 
										stroke={primaryColor} 
										strokeOpacity="1"
										cx="165.122" 
										cy="275.459" 
										rx="44.9758" 
										ry="46.5147" 
									/>
									<rect 
										x="136.316" 
										y="211.333" 
										fill="#030409" 
										fillOpacity="1" 
										fillRule="evenodd" 
										strokeWidth="0.2"
										strokeLinejoin="round" 
										width="35.2869" 
										height="141.75" 
									/>
									<path 
										fill={primaryColor} 
										fillOpacity="1" 
										strokeWidth="0.2" 
										strokeLinejoin="round"
										d="M 139.524,159.101L 152.356,145.217L 152.356,405.563L 139.695,415.003L 139.524,165.619" 
									/>
									<path 
										fill={primaryColor} 
										fillOpacity="1" 
										strokeWidth="0.2" 
										strokeLinejoin="round" 
										d="M 158.771,142.009L 168.321,128.068L 168.321,389.484L 158.898,398.963L 158.771,148.554" 
									/>
								</>
							)}

							
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="3"
								y1="421.5" x2="80" y2="421.5" />
							<path fill="none" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" stroke={ secondaryColor }
								strokeOpacity="1" d="M 267,421.5L 727,422.5C 727,422.5 790,384.5 790,372.5L 1667,372.5" />
							<path fill={ primaryColor } fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round"
								d="M 283,408.512C 283,408.512 312.441,374.5 311.309,374.5L 762,374.499C 762,374.499 762,375.761 761.592,376.286C 756.392,382.96 730.578,403.851 717.129,407.314C 701.276,411.396 283,408.512 283,408.512 Z " />
							<path fill={ primaryColor } fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
								d="M 335.629,233.5L 330,214.5L 1688.99,214.5L 1699,233.5L 335.629,233.5 Z " />
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="323"
								y1="194.5" x2="750" y2="194.5" />
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="811"
								y1="194.5" x2="1688" y2="194.5" />
							<path fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1"
								d="M 2193,194.499L 2511.73,194.5L 2547,227.5L 2851,227.5" />
							<text
								transform="matrix(.8026504516601561 0.0000000000000000 0.0000000000000000 1.0000000000000000 372.00 307.00)">
								<tspan className="message" letterSpacing="0.05em" fill={ secondaryColor }
									fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round" id="message">{messageText}</tspan>
							</text>
							<text
								transform="matrix(1.6098481416702268 0.0000000000000000 0.0000000000000000 1.0000000000000000 373.00 352.00)">
								<tspan className="message-besh" letterSpacing="0.00em"
									fill={ secondaryColor } fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round" id="message-besh">{messageText}</tspan>
							</text>
							<path fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1"
								d="M 183,103.5L 227,64.5L 341,64.5002L 367,42.5002L 1267,42.5002L 1291,64.5002L 2275,64.5002" />
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="2319.5"
								y1="32.4995" x2="2851" y2="32.4995" />
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="2193"
								y1="194.499" x2="2512" y2="194.499" />
							<path fill={ secondaryColor } fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round"
								d="M 322,184.5C 322,184.5 283,129.5 210,107.5C 207.307,106.689 207,103.5 207,103.5C 208,102.5 227,82.5002 227,82.5002L 353,82.5002L 382,57.4998L 1250,56.4998L 1275,80.4998L 1382.48,80.4998L 1383.14,182.576L 322,184.5 Z " />
							<text
								transform="matrix(0.9286589622497559 0.0000000000000000 0.0000000000000000 1.0000000000000000 400.00 159.00)">
								<tspan className="title" letterSpacing="0.05em" fill={ topLettersColor }
									fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round">{ ship.toUpperCase() }</tspan>
							</text>
							<text
								transform="matrix(1.9477475881576538 0.0000000000000000 0.0000000000000000 1.0000000000000000 400.00 118.00)">
								<tspan className="title-besh" letterSpacing="0.01em"
									fill={ topLettersColor } fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round">{ ship }
								</tspan>
							</text>
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="2745"
								y1="261.5" x2="2803" y2="261.5" />
							<path fill={ secondaryColor } fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round"
								d="M 2147,80.5002L 2282.45,80.5002L 2305.31,53.5002L 2851,53.5002L 2851,210.578L 2547.84,211.5L 2514.05,180.5L 2147,180.5L 2147,80.5002 Z " />
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ topLettersColor } strokeOpacity="1" x1="2842"
								y1="178.5" x2="2774" y2="178.5" />
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ topLettersColor } strokeOpacity="1" x1="2570"
								y1="178.5" x2="2731" y2="178.5" />
							<text
								transform="matrix(0.7700805664062499 0.0000000000000000 0.0000000000000000 1.0000000000000000 2316.00 142.00)">
								<tspan className="location-string" letterSpacing="0.05em" fill={ topLettersColor }
									fillOpacity="1" strokeLinejoin="round" id="location-string">{locationText.toUpperCase()}</tspan>
							</text>
							<text 
								// @ts-ignore
								transform={`matrix(0.8685918450355529 0.0000000000000000 0.0000000000000000 1.0000000000000000 ${cabinText.length > 4 ? '2500.00' : '2550.00'} 147.00)`} space="preserve">
								<tspan className="cabin-string" letterSpacing="0.10em" fill={topLettersColor}
									fillOpacity="1" strokeLinejoin="round" id="cabin">{cabinText}</tspan>
							</text>
							<text
								transform="matrix(1.5309972763061521 0.0000000000000000 0.0000000000000000 1.0000000000000000 2316.00 107.00)">
								<tspan className="location-string-besh" letterSpacing="0.01em"
									fill={ topLettersColor } fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round"
									id="location-string-besh">{locationText.toUpperCase()}</tspan>
							</text>
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="1634.25"
								y1="372.5" x2="2211" y2="372.5" />
							<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="2147"
								y1="372.5" x2="2851" y2="372.5" />
							<path fill={ primaryColor } fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
								d="M 1637.24,233.5L 1635,214.5L 2175.02,214.5L 2179,233.5L 1637.24,233.5 Z " />
							<path fill={ primaryColor } fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
								d="M 2160.45,233.499L 2159,214.499L 2509.42,214.499L 2528,233.5L 2160.45,233.499 Z " />
							<path fill={ secondaryColor } fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round"
								d="M 1379,80.4998L 2227.08,80.4998L 2228,181.032L 1379.45,182.719L 1379,80.4998 Z " />
							<path fill="none" strokeWidth="10" strokeLinejoin="round" stroke="#030409" strokeOpacity="1"
								d="M 167.5,104.501C 262.769,104.501 341,180.732 341,276.001C 341,371.27 285.016,441.738 163,439.5C 54,437.5 11,371.769 11,276.5C 11,181.231 72.2306,104.501 167.5,104.501 Z " />
							<ellipse fill="none" strokeWidth="10" strokeLinejoin="round" stroke={ primaryColor } strokeOpacity="1" cx="170"
								cy="275.458" rx="162" ry="162" />
						</svg>
					</div>
					<svg className="banner-bottom" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink"
						version="1.1" baseProfile="full" viewBox="0 0 2854.00 142.50" enableBackground="new 0 0 2854.00 142.50"
						preserveAspectRatio="preserve">
						<path fill="#030409" fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
							d="M 3,133.5L 3,5.50034L 499.012,5.50034L 571.732,72.5003L 2295.29,71.5003L 2330.02,46.5003L 2851,46.5003L 2851,142.5L 3,142.5" />
						<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="2330.02"
							y1="60.5041" x2="2851" y2="60.5006" />
						<path fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1"
							d="M 2399.49,43.501L 2330.02,43.5001L 2295.29,69.5006L 1955.57,69.5006" />
						<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="2851"
							y1="43.5001" x2="2330.02" y2="43.501" />
						<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="568.475"
							y1="86.5011" x2="2086.9" y2="86.4911" />
						<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="586.927"
							y1="70.0083" x2="2086.7" y2="70.0004" />
						<path fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1"
							d="M 592.354,99.4979L 2814.13,99.493L 2848.83,126.494" />
						<path fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1"
							d="M 3,19.5004L 496.841,19.5003L 569.561,86.5004L 617.317,86.5006" />
						<path fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1"
							d="M 3,3.00009L 499.012,3.00003L 571.732,70.0001L 619.488,70.0003" />
						<path fill={ secondaryColor } fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
							d="M 148.439,135.501L 164.719,116.501L 1804.13,116.501L 1816.2,135.501L 148.439,135.501 Z " />
						<path fill={ secondaryColor } fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
							d="M 1741.7,135.501L 1739,116.501L 2390.46,116.501L 2395.25,135.501L 1741.7,135.501 Z " />
						<path fill={ secondaryColor } fillOpacity="1" fillRule="evenodd" strokeWidth="0.2" strokeLinejoin="round"
							d="M 2372.88,135.5L 2371.13,116.5L 2793.85,116.5L 2816.27,135.501L 2372.88,135.5 Z " />
						<path fill="none" fillRule="evenodd" strokeWidth="6" strokeLinejoin="round" stroke={ primaryColor }
							strokeOpacity="1" d="M 52.9268,131.5L 126.732,131.5L 141.394,117.991" />
						<line fill="none" strokeWidth="6" strokeLinejoin="round" stroke={ secondaryColor } strokeOpacity="1" x1="509.866"
							y1="99.4997" x2="559.793" y2="99.4987" />
					</svg>
				</div>
			</div>
		</AbsoluteFill >
	);
};