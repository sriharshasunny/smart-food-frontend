import { useState, useEffect, useCallback } from 'react';

const useVoiceRecognition = (onResult) => {
    const [isListening, setIsListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setSupported(true);
                const recog = new SpeechRecognition();
                recog.continuous = false;
                recog.interimResults = false;
                recog.lang = 'en-US';

                recog.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if (onResult) {
                        onResult(transcript);
                    }
                    setIsListening(false);
                };

                recog.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                recog.onend = () => {
                    setIsListening(false);
                };

                setRecognition(recog);
            }
        }
    }, [onResult]);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
                setIsListening(true);
            } catch (err) {
                console.error("Error starting speech recognition", err);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition, isListening]);

    return { isListening, supported, startListening, stopListening };
};

export default useVoiceRecognition;
