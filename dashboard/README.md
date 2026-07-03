# Techathon Rover Summit - Smart Office Dashboard

This is the frontend dashboard for the **Lights, Fans, Discord (LFD)** project. It provides a real-time, interactive, and visually stunning web interface to monitor and control the electrical devices (fans and lights) across a simulated smart office environment.

## 🌟 Key Features

* **Interactive Floor Plan**: A top-down layout of the office featuring custom SVG animations.
  * **Dynamic Lighting**: When lights are toggled ON, a warm, ambient glow dynamically illuminates the corresponding room using CSS `mix-blend-mode` effects.
  * **Animated Fixtures**: Custom wooden 3-blade ceiling fan SVGs physically rotate when activated.
* **Live Power Consumption Meter**:
  * Real-time radial gauge component tracking total wattage.
  * Live bar charts breaking down the electrical load by individual rooms.
* **Live Device Status Panel**: iOS-style toggle switches allowing you to manually control the state of 15 devices (lights and fans) across 3 different rooms.
* **Modern Aesthetic**: A bright, clean, glassmorphic UI utilizing CSS Grid for a fully responsive 3-column layout.
* **No Backend Required**: The application runs a full local state simulation in the browser, making it incredibly easy to test and demonstrate immediately!

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with modern custom properties (CSS Variables) and Grid layouts.
- **Charts**: `recharts` for the bar charts and `react-gauge-component` for the power dial.
- **Icons**: Custom SVGs & `lucide-react`

## 📦 Installation & Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd dashboard
   ```

2. **Install dependencies**:
   Make sure you have Node.js and npm installed.
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **View the Dashboard**:
   Open your browser and navigate to the local URL provided in your terminal (usually `http://localhost:5173`).

## 📁 Project Structure

```
dashboard/
├── public/                 # Static assets (images, fonts)
│   └── Gemini_Generated_Image...png # Blank Floor plan background
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ActiveAlertsPanel.jsx   # Displays system alerts
│   │   ├── DeviceIcon.jsx          # Custom SVG fans and lights
│   │   ├── DiscordBotPanel.jsx     # Mock chat interface
│   │   ├── LiveDevicePanel.jsx     # Accordion list with toggle switches
│   │   ├── OfficeFloorPlan.jsx     # Interactive layout with absolute positioning
│   │   └── PowerConsumptionMeter.jsx # Gauge and Bar charts
│   ├── App.jsx             # Main application state and layout grid
│   ├── App.css             # Component-specific styles and animations
│   ├── index.css           # Global theme variables and typography
│   └── main.jsx            # React root injection
└── package.json            # Project dependencies and scripts
```

## 🛠️ Usage

The dashboard relies on an internal React `useState` simulation for immediate interaction:
- Expand a room in the **Live Device Status Panel**.
- Click the toggle switch next to any device.
- Watch the **Live Power Consumption Meter** update instantly (Fans = 60W, Lights = 15W).
- Check the **Top Down Office Layout** to see the fan start spinning or the light circle glow brightly and illuminate its room!

## 📝 License

This project is built for the Techathon Rover Summit. Feel free to modify and expand upon it!
