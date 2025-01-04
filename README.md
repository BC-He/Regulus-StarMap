# Star Map Project

A star map visualization project built using **Node.js** and **React.js**, designed to display stars from the SAO catalog with features like zooming, panning, and searching for stars by clicking.

## Features

- **Star Visualization**: Display stars using data from the SAO catalog.
- **Zoom and Pan**: Explore the star map by zooming in and out and dragging to move around.
- **Search by Click**: Click anywhere on the star map to find and highlight the nearest star.
- **Responsive Design**: Adjusts dynamically to different screen sizes.

## Data Source

The star information is obtained from the **SAO catalog** provided by NASA:
[SAO Catalog - HEASARC](https://heasarc.gsfc.nasa.gov/w3browse/star-catalog/sao.html).

## Installation and Usage

### Prerequisites
- **Node.js** installed on your system.
- **npm** or **yarn** package manager.

### Steps to Run the Project

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/star-map.git
   cd star-map
2. **Install Dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```
3. **Run the server**
   ```bash
   npm run dev

### Project Structure
src/: Contains the React application code.

hooks/: Custom hooks, including the useStarMap hook for managing the star map's state and behavior.
components/: React components for rendering UI elements.
utils/: Helper functions for various tasks, such as scaling and axis label updates.
sao_catalog.js: The star data from the SAO catalog.
public/: Static assets and the entry point index.html.

How It Works
Data Visualization:

The project parses the star data from the SAO catalog to calculate the positions of stars.
The stars are plotted using the d3 library on an interactive SVG.
Zoom and Pan:

The d3.zoom functionality allows users to zoom in and out and drag the star map.
Search Functionality:

By clicking on the map, the application identifies the nearest star using a distance calculation algorithm.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
