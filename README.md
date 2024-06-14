# Pupperio
This project is a high-performance web scraping and automation framework built using Node.js, Puppeteer, and Cheerio. It provides a robust set of APIs for automating browser actions, extracting data, and managing complex workflows with reusable parameters and functions.

## Features

- **Web Scraping**: Automates browser interactions and DOM manipulation for efficient data extraction.
- **Dynamic Task Execution**: Supports ordered task sequences, conditional logic, and customizable delays using JavaScript Promises and async/await.
- **Global Definitions**: Manages reusable parameters, functions, and scripts for enhanced modularity and maintainability.
- **API Endpoints**: Provides comprehensive RESTful APIs for browser operations, including session management, navigation, and element interaction.
- **Error Handling and Logging**: Ensures robust automation with detailed execution traceability.
- **Docker Containerization**: Containerized using Docker and deployed on Render for seamless integration and deployment.

## Getting Started

### Prerequisites

- Node.js
- Docker (optional, for containerization)
- Render account (optional, for deployment)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.comitsme-shivamkumar/pupperio.git
    cd your-repo-name
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following content:
    ```plaintext
    NODE_ENV=development
    PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
    ```

### Running the Project

1. Start the server:
    ```bash
    npm start
    ```

2. The server will be running on `http://localhost:3000`.

### API Endpoints

- **Initialize Browser**
  - **Endpoint**: `/init`
  - **Method**: `POST`
  - **Description**: Launches a Puppeteer browser instance and opens a new tab.

- **Get Status**
  - **Endpoint**: `/status`
  - **Method**: `GET`
  - **Description**: Checks if the server is running.

- **Go to Page**
  - **Endpoint**: `/goto`
  - **Method**: `POST`
  - **Body**: `{ "link": "https://example.com", "timeout": 5000, "waitForSelector": "#selector" }`
  - **Description**: Navigates to a given URL and optionally waits for a specific selector.

- **Take Screenshot**
  - **Endpoint**: `/screenshot`
  - **Method**: `GET`
  - **Description**: Takes a screenshot of the current page.

- **Scrape Using Cheerio**
  - **Endpoint**: `/cheerio-scrape`
  - **Method**: `POST`
  - **Body**: `{ "selector": "#selector", "type": "text" }`
  - **Description**: Scrapes content from the current page based on the provided selector and type.

- **Click on Element**
  - **Endpoint**: `/click`
  - **Method**: `POST`
  - **Body**: `{ "selector": "#selector" }`
  - **Description**: Clicks on an element identified by the provided selector.

- **Type in Input**
  - **Endpoint**: `/type`
  - **Method**: `POST`
  - **Body**: `{ "selector": "#selector", "data": "text to type" }`
  - **Description**: Types into an input field identified by the provided selector.

- **Open New Tab**
  - **Endpoint**: `/new-tab`
  - **Method**: `GET`
  - **Description**: Opens a new tab in the browser.

- **Switch to Tab Index**
  - **Endpoint**: `/switch-tab`
  - **Method**: `POST`
  - **Body**: `{ "tabIndex": 1 }`
  - **Description**: Switches the current context to a tab identified by its index.

- **Close Current Tab**
  - **Endpoint**: `/close-current-tab`
  - **Method**: `GET`
  - **Description**: Closes the current tab and switches to the last open tab.

- **Close Browser**
  - **Endpoint**: `/close-browser`
  - **Method**: `GET`
  - **Description**: Closes the browser instance.

### Containerization

1. **Build Docker Image**:
    ```bash
    docker build -t your-image-name .
    ```

2. **Run Docker Container**:
    ```bash
    docker run -p 3000:3000 your-image-name
    ```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.

## License

This project is licensed under the MIT License.

