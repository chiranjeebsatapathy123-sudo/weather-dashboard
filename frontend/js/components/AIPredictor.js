export const AIPredictor = {
    async trainAndPredict(historyData) {
        if (!window.tf) {
            throw new Error("TensorFlow.js failed to load. Please check your connection.");
        }
        
        // Prepare Data
        // History data comes as an array of 7 objects: { date, tempHigh, tempLow, precipitation }
        if (!historyData || historyData.length < 5) {
            throw new Error("Not enough historical data to train the neural network.");
        }

        const temps = historyData.map(h => h.tempHigh);
        
        // Create Sequences: [X1, X2, X3] -> Y
        // Since we only have 7 days, we'll use a window size of 3
        const windowSize = 3;
        const X = [];
        const Y = [];
        
        for (let i = 0; i <= temps.length - windowSize - 1; i++) {
            X.push(temps.slice(i, i + windowSize));
            Y.push(temps[i + windowSize]);
        }

        const xs = tf.tensor2d(X);
        const ys = tf.tensor2d(Y, [Y.length, 1]);

        // Build a simple Dense Neural Network
        const model = tf.sequential();
        model.add(tf.layers.dense({units: 8, inputShape: [windowSize], activation: 'relu'}));
        model.add(tf.layers.dense({units: 8, activation: 'relu'}));
        model.add(tf.layers.dense({units: 1}));

        model.compile({optimizer: tf.train.adam(0.05), loss: 'meanSquaredError'});

        // Train Model (Wait for UI to render first)
        let lossHistory = [];
        await model.fit(xs, ys, {
            epochs: 50,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    lossHistory.push(logs.loss);
                    const el = document.getElementById('tfLossDisplay');
                    if (el) {
                        el.innerText = `Epoch ${epoch + 1}: Loss = ${logs.loss.toFixed(4)}`;
                    }
                    const bar = document.getElementById('tfProgressBar');
                    if (bar) {
                        bar.style.width = `${((epoch + 1) / 50) * 100}%`;
                    }
                }
            }
        });

        // Predict Tomorrow
        // The last 'windowSize' days from history:
        const recentInput = temps.slice(temps.length - windowSize);
        const inputTensor = tf.tensor2d([recentInput]);
        const prediction = model.predict(inputTensor);
        
        const predictedTemp = prediction.dataSync()[0];
        
        // Clean up memory
        xs.dispose();
        ys.dispose();
        inputTensor.dispose();
        prediction.dispose();
        model.dispose();

        return {
            predictedTemp: predictedTemp.toFixed(1),
            confidence: (100 - (lossHistory[lossHistory.length - 1] * 2)).toFixed(1) // Fake confidence scaling
        };
    }
};
