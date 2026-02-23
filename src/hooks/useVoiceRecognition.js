import { useState, useEffect, useRef, useCallback } from 'react';

const useVoiceRecognition = (onCommand, onInterimResult) => {
    const [isListening, setIsListening] = useState(false);
    const [supported, setSupported] = useState(false);
    const [transcript, setTranscript] = useState('');

    const recognitionRef = useRef(null);
    const onCommandRef = useRef(onCommand);
    const onInterimResultRef = useRef(onInterimResult);

    useEffect(() => {
        onCommandRef.current = onCommand;
        onInterimResultRef.current = onInterimResult;
    }, [onCommand, onInterimResult]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setSupported(true);
                const recog = new SpeechRecognition();
                recog.continuous = true;
                recog.interimResults = true;
                recog.lang = 'en-US';

                recog.onresult = (event) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    const currentTranscript = (finalTranscript + interimTranscript).trim();
                    setTranscript(currentTranscript);

                    if (onInterimResultRef.current) {
                        onInterimResultRef.current(currentTranscript);
                    }

                    const lowerTranscript = currentTranscript.toLowerCase();
                    if (lowerTranscript.endsWith('enter') || lowerTranscript.endsWith(' search') || lowerTranscript.endsWith(' send')) {
                        const cleanText = currentTranscript.replace(/enter$|search$|send$/i, '').trim();

                        if (onCommandRef.current) {
                            onCommandRef.current(cleanText);
                        }

                        recog.stop();
                        setIsListening(false);
                    }
                };

                recog.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                recog.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recog;
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript('');
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error('Error starting speech recognition', err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { isListening, supported, startListening, stopListening, transcript, setTranscript };
};

export default useVoiceRecognition;
