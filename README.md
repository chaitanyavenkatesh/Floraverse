# FloraVerse 🌿

FloraVerse is a comprehensive digital ecosystem designed for plant enthusiasts. It combines a vibrant marketplace for buying and selling plants with an advanced AI-powered gardening assistant to help users identify plants and diagnose diseases.

## 🚀 Features

### 🛒 Dual-Role Marketplace
*   **For Buyers**: Browse a curated selection of plants, seeds, and gardening tools. Integrated cart system for a seamless shopping experience.
*   **For Sellers**: Dedicated dashboard to list products, manage inventory, and receive order notifications.

### 🤖 AI Gardening Assistant (FloraBot)
*   **Expert Advice**: Powered by Google Gemini AI to answer any gardening or botanical questions.
*   **Plant Identification**: Upload an image to identify plant species instantly.
*   **Disease Diagnosis**: Get organic and chemical treatment recommendations for sick plants via image analysis.

### ✨ Modern User Experience
*   **Responsive Design**: Optimized for mobile, tablet, and desktop using Tailwind CSS.
*   **Persistant State**: Uses local storage to keep your session and cart data safe across browser refreshes.
*   **Elegant UI**: Clean, glassmorphism-inspired design with smooth transitions.

## 🛠️ Tech Stack

*   **Core**: React 19, TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **State Management**: React Context API
*   **Routing**: React Router DOM
*   **AI Integration**: Google Gemini 2.5 Flash
*   **Icons**: Lucide React

## 🏁 Getting Started

### Prerequisites
*   Node.js (Latest LTS recommended)
*   NPM

### Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd FloraVerse
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run Dev Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
src/
├── components/      # Reusable UI components (Navbar, Cards, etc.)
├── context/         # Store management using Context API
├── pages/           # Page-level components (Home, Dashboards, AI Bot)
├── services/        # External API services (Gemini integration)
└── types.ts         # TypeScript definitions
```

## 📄 License
This project is for educational purposes.
