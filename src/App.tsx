import { useState, useRef, useEffect } from "react";
import { pinata } from "./utils/config";

// Simple Loader Component
const Loader: React.FC = () => (
  <div className="flex justify-center items-center my-4">
    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
  </div>
);

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [topText, setTopText] = useState<string>("");
  const [bottomText, setBottomText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(30);
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [fontStyle, setFontStyle] = useState<string>("Impact");
  const [topTextPosition, setTopTextPosition] = useState<{ x: number; y: number }>({ x: 250, y: 40 });
  const [bottomTextPosition, setBottomTextPosition] = useState<{ x: number; y: number }>({ x: 250, y: 460 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [uploadedCid, setUploadedCid] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 500, height: 500 });

  const fontStyles = [
    "Impact",
    "Arial",
    "Helvetica",
    "Comic Sans MS",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Trebuchet MS",
    "Arial Black",
  ];

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUrl("");
    setError("");
    if (file) {
      const img = new Image();
      img.onload = () => {
        setCanvasSize({ width: img.width, height: img.height });
        setTopTextPosition({ x: img.width / 2, y: 40 });
        setBottomTextPosition({ x: img.width / 2, y: img.height - 40 });
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSubmission = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const upload = await pinata.upload.file(selectedFile);
      console.log(upload);
      setUploadedCid(upload.cid);
      await refreshSignedUrl(upload.cid);
    } catch (error: any) {
      console.error(error);
      setError("Failed to upload the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSignedUrl = async (cid: string) => {
    try {
      const signedUrl = await pinata.gateways.createSignedURL({
        cid: cid,
        expires: 300, // Set expiration to 5 minutes (300 seconds)
      });
      setUrl(signedUrl);
    } catch (error: any) {
      console.error("Failed to refresh signed URL:", error);
      setError("Failed to refresh the image URL. Please try again.");
    }
  };

  const drawMeme = () => {
    if (!canvasRef.current || !url) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = url;

    image.crossOrigin = "Anonymous"; // Handle cross-origin issues

    image.onload = () => {
      // Set canvas size to match image
      canvas.width = image.width;
      canvas.height = image.height;
      setCanvasSize({ width: image.width, height: image.height });

      // Clear the canvas
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the image on the canvas
      ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx!.font = `${fontSize}px ${fontStyle}`;
      ctx!.textAlign = "center";
      ctx!.fillStyle = textColor;
      ctx!.strokeStyle = "black";
      ctx!.lineWidth = 2;

      // Draw top text
      ctx?.fillText(topText, topTextPosition.x, topTextPosition.y);
      ctx?.strokeText(topText, topTextPosition.x, topTextPosition.y);

      // Draw bottom text
      ctx?.fillText(bottomText, bottomTextPosition.x, bottomTextPosition.y);
      ctx?.strokeText(bottomText, bottomTextPosition.x, bottomTextPosition.y);
    };

    image.onerror = () => {
      setError("Failed to load the image. Please try a different file.");
    };
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Convert canvas to blob and trigger download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "meme_with_text.png"; // Set the download file name
      link.click();
      window.URL.revokeObjectURL(downloadUrl); // Clean up URL object after download
    }, "image/png");
  };

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (uploadedCid) {
      refreshInterval = setInterval(() => {
        refreshSignedUrl(uploadedCid);
      }, 4 * 60 * 1000); // Refresh every 4 minutes
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [uploadedCid]);

  useEffect(() => {
    if (url) {
      drawMeme();
    }
  }, [url, topText, bottomText, fontSize, textColor, fontStyle, topTextPosition, bottomTextPosition]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">Meme Generator</h1>

      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Choose Image
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={changeHandler}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
            {error.includes("URL") && (
              <button
                onClick={() => refreshSignedUrl(uploadedCid)}
                className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
              >
                Refresh URL
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleSubmission}
          disabled={isLoading}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Uploading..." : "Submit"}
        </button>

        {isLoading && <Loader />}
      </div>

      {url && (
        <div className="w-full max-w-4xl mt-8 bg-white rounded shadow p-6">
          <div className="flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border border-gray-300 mb-4"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Top Text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            <div className="flex space-x-2">
              <input
                type="number"
                value={topTextPosition.x}
                onChange={(e) => setTopTextPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Top Text X"
              />
              <input
                type="number"
                value={topTextPosition.y}
                onChange={(e) => setTopTextPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Top Text Y"
              />
            </div>
            <input
              type="text"
              placeholder="Bottom Text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
            <div className="flex space-x-2">
              <input
                type="number"
                value={bottomTextPosition.x}
                onChange={(e) => setBottomTextPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Bottom Text X"
              />
              <input
                type="number"
                value={bottomTextPosition.y}
                onChange={(e) => setBottomTextPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Bottom Text Y"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="font-size" className="text-gray-700">
                Font Size:
              </label>
              <input
                id="font-size"
                type="number"
                min="10"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
              <label htmlFor="text-color" className="text-gray-700">
                Text Color:
              </label>
              <input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="font-style" className="text-gray-700">
                Font Style:
              </label>
              <select
                id="font-style"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              >
                {fontStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={drawMeme}
                className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Update Meme
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Download Meme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;