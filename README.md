# Biochip HUD 🦾

Cyberpunk-inspired tactical interface for NFC biochips. Bridges human-device interaction via Tasker and real-time Termux diagnostics.

## 🏗️ Architecture
This project is not a standalone app. It is a web-based frontend designed to act as a visual layer for advanced Android automation.
- **Trigger:** 13.56MHz NFC Implant (or any standard NFC Tag).
- **Engine:** Tasker + AutoTools (Web Screen overlay).
- **Diagnostics:** Termux + Termux:Tasker plugin (for ARP/IP tracking).
- **Frontend:** HTML, CSS, vanilla JS, and Tailwind CSS.

## 🚀 How to Setup (Tasker Integration)

To make this HUD actually control your device, you need to bridge the web interface with Tasker.

### 1. Host the Interface
1. Fork this repository.
2. Enable **GitHub Pages** in your repo settings (deploy from `main` branch).
3. Copy your live GitHub Pages URL.

### 2. Tasker: The Trigger Profile
1. Create a new Profile: `Event > Net > NFC Tag`.
2. Scan your biochip/tag to register its ID.

### 3. Tasker: The Executor Task
Link the profile above to a new Task with the following actions:

**A. Render the HUD**
- Add `Plugin > AutoTools > Web Screen`.
- Set Display Mode to `Overlay` or `Dialog`.
- In `Source`, paste your GitHub Pages URL.

**B. Inject your physical Chip ID**
- Add `Plugin > AutoTools > Web Screen`.
- Go to `Advanced > Execute JavaScript`.
- Enter: `setChipId('%evtprm3')` *(Note: Tasker usually stores the scanned NFC ID in the `%evtprm()` array)*.

### 4. Tasker: The Command Receiver
The HUD buttons send commands back to Tasker using the AutoApps command system. 
1. Create a new Profile: `Event > Plugin > AutoApps`.
2. Set Command Filter to `hud=:=` and check "Exact".
3. Link it to a Task using `If` conditions based on the `%aacomm` variable:
   - `If %aacomm ~ nav_tether` -> Action: `WiFi Tether (Toggle)`
   - `If %aacomm ~ nav_comms` -> Action: `Launch App (Telegram)`
   - `If %aacomm ~ nav_diag` -> Action: Run Termux script to get network data and inject via `updateRealDiag('%termux_output')`.

## 🛡️ License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
