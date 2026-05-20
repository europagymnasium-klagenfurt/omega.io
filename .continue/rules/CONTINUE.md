# CONTINUE.md for Omega.io Project

## Project Overview

Omega.io is a simple browser-based car racing game built with Node.js, Express, and Socket.io. The game features top-down racing mechanics and is designed to be played in a web browser.

### Key Technologies

- Node.js
- Express
- Socket.io
- HTML/CSS/JavaScript

### High-level Architecture

The project follows a client-server architecture:

1. **Server**: Node.js with Express handles HTTP requests and serves static files.
2. **Real-time Communication**: Socket.io enables real-time communication between clients and server.
3. **Client**: HTML/CSS/JavaScript for the game interface and game logic.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A modern web browser

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/europagymnasium-klagenfurt/omega.io.git
   ```
2. Navigate to the project directory:
   ```bash
   cd omega.io
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Basic Usage

1. Start the server:
   ```bash
   npm start
   ```
2. Open your web browser and navigate to `http://localhost:3000`

### Running Tests

- No tests are currently specified for this project. You can add tests by creating a test script in the `package.json` file.

## Project Structure

### Main Directories

- **public**: Contains static files like HTML, CSS, and client-side JavaScript.
- **node_modules**: Contains all the project dependencies.

### Key Files

- **server.js**: The main server file that sets up the Express server and Socket.io.
- **public/index.html**: The main HTML file for the game interface.
- **public/game.js**: Contains the client-side game logic.

### Important Configuration Files

- **package.json**: Contains project metadata and dependencies.
- **.gitignore**: Specifies files and directories to be ignored by Git.

## Development Workflow

### Coding Standards

- Follow the existing code style and conventions.
- Use meaningful variable and function names.
- Add comments to explain complex logic.

### Testing Approach

- No formal testing framework is currently in place. Consider adding tests for critical game functions.

### Build and Deployment

- The project can be deployed to any Node.js hosting service.
- Ensure to set the correct environment variables for production.

### Contribution Guidelines

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with descriptive messages.
4. Push your branch to your fork.
5. Create a pull request to the main repository.

## Key Concepts

### Domain-specific Terminology

- **Socket.io**: A library for real-time web applications.
- **Express**: A minimal and flexible Node.js web application framework.

### Core Abstractions

- **Game State**: Managed on the server and synchronized with clients via Socket.io.
- **Player Input**: Handled on the client side and sent to the server for processing.

### Design Patterns

- **Observer Pattern**: Used by Socket.io for real-time communication.
- **Singleton Pattern**: The Express server instance is typically a singleton.

## Common Tasks

### Adding a New Feature

1. Create a new branch for the feature.
2. Implement the feature in the appropriate files.
3. Test the feature thoroughly.
4. Create a pull request with a detailed description of the changes.

### Debugging

- Use `console.log` statements to debug client-side code.
- Use server-side logging for debugging server-side code.

## Troubleshooting

### Common Issues

- **Server Not Starting**: Ensure all dependencies are installed and the correct Node.js version is used.
- **Game Not Loading**: Check the browser console for errors and ensure the server is running.

### Debugging Tips

- Use browser developer tools to inspect the game interface.
- Use server-side logging to track real-time communication.

## References

### Documentation

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/v4/)

### Resources

- [GitHub Repository](https://github.com/europagymnasium-klagenfurt/omega.io)
- [Project Homepage](https://github.com/europagymnasium-klagenfurt/omega.io#readme)

This CONTINUE.md file provides a comprehensive guide to understanding and working with the Omega.io project. Review and edit it as needed to ensure it meets your project's specific requirements.