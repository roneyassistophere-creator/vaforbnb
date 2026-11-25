/** Save text as a file on the visitor's device (nothing is uploaded). */
export function downloadText(fileName: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read a file the visitor chose, on their device. */
export const readFileText = (file: File) => file.text();
