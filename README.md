# **Meme Generator with Pinata and React (Vite)**

This project is a **Meme Generator** built with React (using Vite as the build tool) and integrated with **Pinata** for decentralized image upload and retrieval via **IPFS**. The app allows users to upload an image, add customizable text on it, and download the generated meme.

## **Features**
- Upload an image to IPFS using Pinata.
- Add customizable top and bottom text to the uploaded image.
- Adjust font style, size, text color, and text position.
- Download the final meme as a PNG.
- The image is stored securely on IPFS using Pinata's gateway, with the option to refresh the image URL periodically.

## **Tech Stack**
- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Storage**: Pinata (IPFS)

## **Getting Started**

Follow the steps below to run the project locally:

### **Prerequisites**
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Pinata Account](https://www.pinata.cloud/) (for the API keys)

### **1. Clone the Repository**
```bash
git clone https://github.com/rajdhokai/meme-generator-pinata.git
cd meme-generator-pinata
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the root of the project and add the following environment variables. Replace the placeholder values with your Pinata credentials:

```
VITE_PINATA_JWT=<your-pinata-jwt-token>
VITE_GATEWAY_URL=<your-pinata-gateway-url>
```

- **VITE_PINATA_JWT**: The JWT token from Pinata for authentication.
- **VITE_GATEWAY_URL**: Your custom Pinata gateway URL (e.g., `https://gateway.pinata.cloud`).

### **4. Run the Development Server**
Start the app locally using Vite's development server:
```bash
npm run dev
```

### **5. Build for Production**
If you want to build the app for production:
```bash
npm run build
```

### **6. Preview Production Build**
To preview the build:
```bash
npm run preview
```

## **Pinata Configuration**

Pinata is integrated using a custom **Pinata SDK** setup. Below is the configuration used in the `utils/config.ts` file:

```typescript
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: `${import.meta.env.VITE_PINATA_JWT}`,
  pinataGateway: `${import.meta.env.VITE_GATEWAY_URL}`,
  customHeaders: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Credentials": "true",
  },
});
```

This setup uses:
- **JWT Authentication**: Replace `VITE_PINATA_JWT` in `.env` with your Pinata JWT token.
- **Pinata Gateway**: `VITE_GATEWAY_URL` for interacting with the Pinata IPFS gateway.
- **CORS Headers**: CORS headers ensure the app can communicate with Pinata.

## **How It Works**
1. **File Upload**: Users can select and upload an image file to Pinata's IPFS service.
2. **Image Retrieval**: After the image is uploaded, it is pinned to IPFS and a **CID** (Content Identifier) is generated. This CID is used to retrieve the image from Pinata's gateway.
3. **Text Customization**: The user can add top and bottom text, adjust the font size, style, color, and position.
4. **Canvas Rendering**: The uploaded image along with the custom text is rendered on an HTML canvas.
5. **Download**: The user can download the meme in PNG format.

## **Dependencies**
- **React**: JavaScript framework for building the user interface.
- **Vite**: Build tool for faster development.
- **Pinata SDK**: Custom SDK for handling file uploads and URL generation with IPFS.

## **License**
This project is licensed under the MIT License.

---

### **Additional Notes**
- To get your **JWT token** from Pinata, visit the Pinata [API Keys](https://app.pinata.cloud/keys) section, create a new key, and enable IPFS pinning.
- Make sure your **Pinata Gateway** allows access to the uploaded files. You can set up a custom gateway for faster retrieval.

---
