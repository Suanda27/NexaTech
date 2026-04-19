"use client";

export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }

            reject(new Error("Invalid file result"));
        };

        reader.onerror = () =>
            reject(reader.error ?? new Error("File read failed"));

        reader.readAsDataURL(file);
    });
}
