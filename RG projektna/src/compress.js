function compressImage(imageFile) {
    function Predict(P, X, Y) {
        let E = new Array(P.length).fill(0);

        for (let x = 0; x < X; x++) {
            for (let y = 0; y < Y; y++) {
                let current_ix = y * X + x;

                if (y === 0 && x === 0) {
                    E[current_ix] = P[0][0];
                } else if (y === 0) {
                    E[current_ix] = P[x - 1][0] - P[x][0];
                } else if (x === 0) {
                    E[current_ix] = P[0][y - 1] - P[0][y];
                } else {
                    if (P[x - 1][y - 1] >= Math.max(P[x - 1][y], P[x][y - 1])) {
                        E[current_ix] = Math.min(P[x - 1][y], P[x][y - 1]) - P[x][y];
                    } else if (P[x - 1][y - 1] <= Math.min(P[x - 1][y], P[x][y - 1])) {
                        E[current_ix] = Math.max(P[x - 1][y], P[x][y - 1]) - P[x][y];
                    } else {
                        E[current_ix] = P[x - 1][y] + P[x][y - 1] - P[x - 1][y - 1] - P[x][y];
                    }
                }
            }
        }

        return E;
    }

    function encode(B, g, value) {
        let bitArray = [];
        for (let bit = g - 1; bit >= 0; bit--) {
            bitArray.push((value >> bit) & 1);
        }
        B.push(...bitArray);
        return B;
    }

    function SetHeader(X, C0, Cn, n) {
        let B = [];
        B = encode(B, 12, X);
        B = encode(B, 8, C0);
        B = encode(B, 32, Cn);
        B = encode(B, 24, n);

        return B;
    }

    function IC(B, C, L, H) {
        if (H - L > 1) {
            if (C[H] !== C[L]) {
                let m = Math.floor(0.5 * (H + L));
                let g = Math.ceil(Math.log2(C[H] - C[L] + 1));
                B = encode(B, g, C[m] - C[L]);

                if (L < m) {
                    B = IC(B, C, L, m);
                }
                if (m < H) {
                    B = IC(B, C, m, H);
                }
            }
        }
        return B;
    }

    function compress(P, X, Y) {
        let E = Predict(P, X, Y);

        let n = X * Y;

        let N = new Array(n).fill(0);
        N[0] = E[0];

        for (let i = 1; i < n; i++) {
            if (E[i] >= 0) {
                N[i] = 2 * E[i];
            } else {
                N[i] = 2 * Math.abs(E[i]) - 1;
            }
        }

        let C = new Array(n).fill(0);
        C[0] = N[0];
        for (let i = 1; i < n; i++) {
            C[i] = C[i - 1] + N[i];
        }

        // Encode header
        let B = SetHeader(X, C[0], C[n - 1], n);

        B = IC(B, C, 0, n - 1);

        // Backfill 0
        B.push(...new Array(8 - B.length % 8).fill(0));

        // Convert to byte array
        let byteArray = [];
        for (let i = 0; i < B.length; i += 8) {
            let bitChunk = B.slice(i, i + 8);
            let byte = parseInt(bitChunk.join(''), 2);
            byteArray.push(byte);
        }

        return byteArray;
    }

    async function ProcessImage(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const X = img.width;
                const Y = img.height;

                const canvas = document.createElement("canvas");
                canvas.width = X;
                canvas.height = Y;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, X, Y);
                const imgData = ctx.getImageData(0, 0, X, Y).data;

                // Convert image to grayscale
                let P = [];
                for (let y = 0; y < Y; y++) {
                    let row = [];
                    for (let x = 0; x < X; x++) {
                        let i = (y * X + x) * 4; // RGBA channels
                        let gray = Math.round(
                            0.299 * imgData[i] +
                                0.587 * imgData[i + 1] +
                                0.114 * imgData[i + 2]
                        );
                        row.push(gray);
                    }
                    P.push(row);
                }

                // Compress image
                console.log("Compressing...");
                const startTime = performance.now();
                const byteArray = compress(P, X, Y);
                const endTime = performance.now();
                console.log(
                    `Compression took ${(endTime - startTime).toFixed(2)} ms.`
                );

                resolve(byteArray);
            };
            img.onerror = (error) => reject(error);

            img.src = URL.createObjectURL(imageFile);
        });
    }

    return ProcessImage(imageFile);
}

export { compressImage };
