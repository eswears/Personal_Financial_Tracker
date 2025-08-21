# Personal Financial Tracker - Scripts

This directory contains batch scripts for managing the Personal Financial Tracker application on Windows.

## Main Scripts

### start-all.bat
Starts all services (backend and frontend) after checking and clearing ports:
- Checks ports 3001 (backend) and 5173 (frontend)
- Kills any existing processes on those ports
- Installs dependencies if needed
- Starts both backend and frontend servers in separate windows

### stop-all.bat
Stops all running services:
- Terminates processes on ports 3001 and 5173
- Closes console windows
- Cleans up any lingering Node.js processes

### restart-all.bat
Restarts all services:
- Calls stop-all.bat
- Waits briefly
- Calls start-all.bat

## Helper Scripts

### check-ports.bat
Displays the status of ports and Node.js processes:
- Shows what's running on ports 3001 and 5173
- Lists all Node.js processes
- Displays process names and PIDs

### install-all.bat
Installs all dependencies for the project:
- Root dependencies
- Backend dependencies
- Frontend dependencies

### kill-all-node.bat
Terminates ALL Node.js processes on the system:
- Shows warning and asks for confirmation
- Lists and terminates all node.exe processes
- Use with caution!

## Individual Service Scripts

### start-backend.bat
Starts only the backend server:
- Checks and clears port 3001
- Installs backend dependencies if needed
- Runs backend in development mode

### start-frontend.bat
Starts only the frontend dev server:
- Checks and clears port 5173
- Installs frontend dependencies if needed
- Runs frontend in development mode

## Usage

1. **First time setup:**
   ```batch
   install-all.bat
   ```

2. **Start the application:**
   ```batch
   start-all.bat
   ```

3. **Stop the application:**
   ```batch
   stop-all.bat
   ```

4. **Check port status:**
   ```batch
   check-ports.bat
   ```

5. **Restart everything:**
   ```batch
   restart-all.bat
   ```

## Port Configuration

- Backend Server: Port 3001
- Frontend Dev Server: Port 5173

These ports are defined in the scripts and match the application's default configuration.

## Notes

- All scripts include colored output for better readability
- Scripts automatically handle dependency installation
- Port checking and process termination is automatic
- Scripts use window titles for better process management