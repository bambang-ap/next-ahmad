import QRScanner from 'react-webcam-qr-scanner';

export type ScannerProps = {};

export function Scanner() {
	const handleDecode = result => {
		console.log(result);
	};

	const handleScannerLoad = mode => {
		console.log(mode);
	};

	return (
		<QRScanner
			onDecode={handleDecode}
			onScannerLoad={handleScannerLoad}
			captureSize={{width: 1280, height: 720}}
			constraints={{
				audio: false,
				video: {
					facingMode: 'environment',
				},
			}}
		/>
	);
}
