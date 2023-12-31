import React, {useRef, useState} from 'react';
import Webcam from 'react-webcam';
import '../styles/webcam.css';

const WebcamComponent = ({ selectedExercise, closeModal }) => {
    const webcamRef = useRef(null);
    const [userId, setUserId] = useState(''); // Assuming user ID is a string; adjust as needed
    const [exerciseLabel, setExerciseLabel] = useState('');
    const [exerciseId, setExerciseId] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);


    if (!selectedExercise) {
        return null; // Don't render the modal if no exercise is selected
    }

    const handleStart = async () => {
        await initializeExercise();
        console.log("new exercise initialized");
        setIsCapturing(true);
        while(isCapturing){
            // sleep
            const imageSrc = webcamRef.current.getScreenshot();
            await sendImageToServer(imageSrc);
        }
    };

    const initializeExercise = async () => {
        try {
            const response = await fetch(``, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(exerciseLabel)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setExerciseId(data);
        } catch (error) {
            console.error('Failed to initialize exercise:', error);
        }
    };

    const sendImageToServer = async (base64Image) => {
        const blob = base64ToBlob(base64Image, 'image/jpeg');
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');

        try {
            const response = await fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();
            console.log(result);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    function base64ToBlob(base64, mime) {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
    }

    const handleStop = () => {
        setIsCapturing(false);
        console.log("Workout stopped!");
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <h2 className={"exercise_name"}>{selectedExercise}</h2>
                <div className="webcam-container">
                    <Webcam className="webcam-view"
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                    />
                    <div className="button-container">
                        <button className="control-button" onClick={handleStart}>Start</button>
                        <button className="control-button" onClick={handleStop}>Stop</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebcamComponent;

