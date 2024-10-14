# SelftyAI Extension 🚀

<!--
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/EXTENSION_ID)](https://chrome.google.com/webstore/detail/selftyai/EXTENSION_ID)
[![License](https://img.shields.io/github/license/SelftyAI/selftyai)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/SelftyAI/extension?style=social)](https://github.com/SelftyAI/extension/stargazers)
-->

<img
  src="https://github.com/user-attachments/assets/3cd3be93-5eaf-4050-9a5b-2bcd68f216af"
  alt="SelftyAI Logo"
  width="200"
  height="200"
/>

## 🧠 About SelftyAI

**SelftyAI** is a powerful extension that brings the capabilities of your preferred Large Language Models (LLMs) directly into your browser. Whether you're researching, shopping, or browsing, SelftyAI provides contextual, relevant answers tailored to your needs using your own AI models.

### 🌟 Key Features

- **Personalized AI Assistance**: Integrate and use your own or preferred LLMs seamlessly within your browser.
- **Contextual Responses**: Receive answers based on the content of any webpage you’re viewing.
- **Multi-Provider Support**: Currently supporting Ollama with plans to add LM Studio, Groq, AI/ML APIs, and more.
- **Privacy-Focused**: Your data stays private and secure, ensuring your browsing and AI interactions are protected.
- **User-Friendly Interface**: Intuitive design for easy interaction with AI directly from your browser.

## 📸 Screenshots

![Extension sidebar](https://github.com/user-attachments/assets/2ce4e3af-32d7-4fae-bca1-651de45291f6)
<br>
*Sidebar interface for interacting with SelftyAI.*

![Settings Page](https://github.com/user-attachments/assets/717dc816-e526-4ad2-893d-202f945a5b36)
<br>
*Configure your AI providers and preferences.*

## 🛠️ Installation

<!--
### 📥 From Chrome Web Store

1. Visit the [SelftyAI Chrome Extension](https://chrome.google.com/webstore/detail/selftyai/EXTENSION_ID) page.
2. Click on **"Add to Chrome"**.
3. Confirm the installation by clicking **"Add Extension"**.
-->

### 🧑‍💻 Manual Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SelftyAI/selftyai.git
   ```
   
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Make build version**:<br>
   Here's two possible version to build for now `chrome` or `opera`
   ```bash
   npm run build:<opera|chrome>
   ```

4. **Navigate to Chrome Extensions**:
   - Open `Chrome` or `Opera` and go to `chrome://extensions/`
  
5. **Enable Developer Mode**:
   - Toggle the `Developer mode` switch on the top right.
  
6. **Load Unpacked Extension**:
   - Click  `Load unpacked` and select the `dist/<chrome|opera>` build folder from previous stages.

## 📝 Usage

1. **Open the Extension**:
- Click on the SelftyAI icon in the toolbar.

2. Configure Your AI Provider:
- Go to Settings and select `Ollama` as your current provider.
- Verify your base URL.
- Install needed models from [Ollama library](https://ollama.com/library)

3. Interact with AI:
- Highlight any text on a webpage.
- Click the SelftyAI icon on the suggested context menu.
- View the AI-generated response in the sidebar.

## 🔌 Supported Providers
- [Ollama](https://ollama.com/) (Currently Supported)
- [LM Studio](https://lmstudio.ai/) (Coming Soon)
- [Groq](https://groq.com/) (Planned)
- [AI/ML API](https://aimlapi.com/) (Planned)
- *...and more!

## 🛣️ Roadmap
We are continuously working to enhance SelftyAI. Here’s what’s coming next:

- Support for LM Studio
- Integration with Groq
- Local RAG Integration
- Web Search Engine
- Expanded AI/ML API Support
- Enhanced Customization Options
- Many Models Conversations
- Improved User Interface and Experience
- Community-Driven Feature Additions

## 📄 License
This project is licensed under the [MIT License](LICENSE).
