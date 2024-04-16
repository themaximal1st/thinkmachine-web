export async function saveFile(
    text,
    filename = "file.txt",
    type = "text/plain"
) {
    const blob = new Blob([text], { type });

    const a = document.createElement("a");
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.addEventListener("click", (e) => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
}

